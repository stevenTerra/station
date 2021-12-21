import { useCallback } from "react"
import BigNumber from "bignumber.js"
import { fromPairs, zipObj } from "ramda"
import { Coin, Coins, MsgExecuteContract, MsgSwap } from "@terra-money/terra.js"
import { isDenom, isDenomLuna, toAmount } from "@terra.kitchen/utils"
import { isDenomTerra, isDenomTerraNative } from "@terra.kitchen/utils"
import { has, toPrice } from "utils/num"
import { getAmount, toAsset, toAssetInfo, toTokenItem } from "utils/coin"
import { toBase64 } from "utils/data"
import { useAddress } from "data/wallet"
import { useLCDClient } from "data/Terra/lcdClient"
import { useSwap } from "./SwapContext"

/* Call this hook after wrap component around with a SwapContext.
Then, various helper functions will be generated based on the fetched data. */

export enum SwapMode {
  ONCHAIN = "On-chain",
  TERRASWAP = "Terraswap",
  ROUTESWAP = "Route",
}

export interface SwapAssets {
  offerAsset: Token
  askAsset: Token
}

export interface SlippageParams {
  mode: SwapMode
  input: number
  offerDecimals: number
  askDecimals: number
  simulated: Amount
  slippageInput: number
}

export interface SwapSpread {
  max_spread: string
  minimum_receive: Amount
  belief_price: string
  price: number
}

export interface SwapParams extends SwapAssets, Partial<SwapSpread> {
  amount: Amount
}

/* simulated */
export interface SimulateResult<T = any> {
  mode: SwapMode
  query: SwapParams
  result: { amount: Amount; payload: T }
}

export interface PayloadOnchain {
  rate: Price
  spread: Amount
}

export interface PayloadTerraswap {
  rate: Price
  fee: Amount
}

export type PayloadRouteswap = string[]

const useSwapUtils = () => {
  const address = useAddress()
  const lcd = useLCDClient()
  const context = useSwap()
  const { exchangeRates, pairs, contracts } = context

  /* helpers */
  // terraswap
  const findPairAddress = useCallback(
    (assets: SwapAssets) => {
      const { offerAsset, askAsset } = assets
      const [pairAddress] =
        Object.entries(pairs).find(([, tokens]) =>
          [offerAsset, askAsset].every((token) => tokens.includes(token))
        ) ?? []

      return pairAddress
    },
    [pairs]
  )

  /* determine swap mode */
  const getIsOnchainAvailable = useCallback(
    ({ offerAsset, askAsset }: SwapAssets) => {
      return [offerAsset, askAsset].every(isDenomTerraNative)
    },
    []
  )

  const getIsTerraswapAvailable = useCallback(
    (assets: SwapAssets) => !!findPairAddress(assets),
    [findPairAddress]
  )

  const getIsRouteswapAvaialble = useCallback(
    (assets: SwapAssets) => {
      if (!contracts) return false
      if (getIsOnchainAvailable(assets)) return false
      if (getIsTerraswapAvailable(assets)) return false

      const r0 =
        getIsOnchainAvailable({ ...assets, askAsset: "uusd" }) ||
        getIsTerraswapAvailable({ ...assets, askAsset: "uusd" })

      const r1 =
        getIsOnchainAvailable({ ...assets, offerAsset: "uusd" }) ||
        getIsTerraswapAvailable({ ...assets, offerAsset: "uusd" })

      return r0 && r1
    },
    [contracts, getIsOnchainAvailable, getIsTerraswapAvailable]
  )

  const getAvailableSwapModes = useCallback(
    (assets: Partial<SwapAssets>): SwapMode[] => {
      if (!validateAssets(assets)) return []

      const functions = {
        [SwapMode.ONCHAIN]: getIsOnchainAvailable,
        [SwapMode.TERRASWAP]: getIsTerraswapAvailable,
        [SwapMode.ROUTESWAP]: getIsRouteswapAvaialble,
      }

      return Object.entries(functions)
        .filter(([, fn]) => fn(assets))
        .map(([key]) => key as SwapMode)
    },
    [getIsOnchainAvailable, getIsTerraswapAvailable, getIsRouteswapAvaialble]
  )

  const getIsSwapAvailable = (assets: Partial<SwapAssets>) =>
    !!getAvailableSwapModes(assets).length

  /* swap mode for multiple swap */
  const getSwapMode = useCallback(
    (assets: SwapAssets) => {
      const { askAsset } = assets
      if (isDenomLuna(askAsset)) {
        return getIsTerraswapAvailable(assets)
          ? SwapMode.TERRASWAP
          : SwapMode.ROUTESWAP
      }

      return SwapMode.ONCHAIN
    },
    [getIsTerraswapAvailable]
  )

  /* simulate | execute */
  type SimulateFn<T = any> = (params: SwapParams) => Promise<SimulateResult<T>>
  const getOnchainParams = useCallback(
    ({ amount, offerAsset, askAsset, minimum_receive }: SwapParams) => {
      if (!address) return { msgs: [] }

      const getAssertMessage = () => {
        if (!getAssertRequired({ offerAsset, askAsset })) return
        if (!(contracts && minimum_receive)) return

        return new MsgExecuteContract(address, contracts.assertLimitOrder, {
          assert_limit_order: {
            offer_coin: { denom: offerAsset, amount },
            ask_denom: askAsset,
            minimum_receive,
          },
        })
      }

      const assert = getAssertMessage()
      const offerCoin = new Coin(offerAsset, amount)
      const swap = new MsgSwap(address, offerCoin, askAsset)
      return { msgs: assert ? [assert, swap] : [swap] }
    },
    [address, contracts]
  )

  const simulateOnchain = async (params: SwapParams) => {
    const getRate = (denom: CoinDenom) =>
      isDenomLuna(denom) ? "1" : getAmount(exchangeRates, denom)

    const { amount, offerAsset, askAsset } = params
    const offerCoin = new Coin(offerAsset, amount)
    const res = await lcd.market.swapRate(offerCoin, askAsset)
    const result = res.amount.toString()

    /* spread */
    const offerRate = getRate(offerAsset)
    const askRate = getRate(askAsset)
    const rate = new BigNumber(askRate).div(offerRate)
    const value = new BigNumber(amount).times(rate)
    const spread = value.minus(result).toString()

    if (!result) throw new Error("Simulation failed")

    return {
      mode: SwapMode.ONCHAIN,
      query: params,
      result: { amount: result, payload: { rate: toPrice(rate), spread } },
    }
  }

  const getTerraswapParams = useCallback(
    (params: SwapParams) => {
      const { amount, offerAsset, askAsset, belief_price, max_spread } = params
      const fromNative = isDenom(offerAsset)
      const pair = findPairAddress({ offerAsset, askAsset })
      const offer_asset = toAsset(offerAsset, amount)

      if (!pair) throw new Error("Pair does not exist")
      const contract = fromNative ? pair : offerAsset

      /* simulate */
      const query = { simulation: { offer_asset } }

      /* execute */
      const swap =
        belief_price && max_spread ? { belief_price, max_spread } : {}
      const executeMsg = fromNative
        ? { swap: { ...swap, offer_asset } }
        : { send: { amount, contract: pair, msg: toBase64({ swap }) } }
      const coins = fromNative ? new Coins({ [offerAsset]: amount }) : undefined
      const msgs = address
        ? [new MsgExecuteContract(address, contract, executeMsg, coins)]
        : []

      return { simulation: { contract: pair, query }, msgs }
    },
    [address, findPairAddress]
  )

  const simulateTerraswap = async (params: SwapParams) => {
    const { simulation } = getTerraswapParams(params)
    const { return_amount, commission_amount } = await lcd.wasm.contractQuery<{
      return_amount: string
      spread_amount: string
      commission_amount: string
    }>(simulation.contract, simulation.query)

    const { assets } = await lcd.wasm.contractQuery<{ assets: [Asset, Asset] }>(
      simulation.contract,
      { pool: {} }
    )

    const pair = fromPairs(
      assets.map(toTokenItem).map(({ amount, token }) => [token, amount])
    )

    const ratio = toPrice(
      new BigNumber(pair[params.offerAsset]).div(pair[params.askAsset])
    )

    return {
      mode: SwapMode.TERRASWAP,
      query: params,
      result: {
        amount: return_amount,
        payload: { rate: ratio, fee: commission_amount },
      },
    }
  }

  const getRouteswapParams = useCallback(
    (params: SwapParams) => {
      /* helper function */
      const createSwap = ({ offerAsset, askAsset }: SwapAssets) => {
        const offer_asset_info = toAssetInfo(offerAsset)
        const ask_asset_info = toAssetInfo(askAsset)
        const buyLuna = isDenomTerra(offerAsset) && isDenomLuna(askAsset)
        return buyLuna || !getIsOnchainAvailable({ offerAsset, askAsset })
          ? { terra_swap: { offer_asset_info, ask_asset_info } }
          : { native_swap: { offer_denom: offerAsset, ask_denom: askAsset } }
      }

      const { amount, offerAsset, askAsset, minimum_receive } = params
      const fromNative = isDenom(offerAsset)
      if (!contracts?.routeswap) throw new Error("Routeswap is not available")

      const route = [offerAsset, "uusd", askAsset]
      const operations = [
        createSwap({ offerAsset, askAsset: "uusd" }),
        createSwap({ offerAsset: "uusd", askAsset }),
      ]

      const options = minimum_receive && { minimum_receive }
      const swapOperations = { ...options, offer_amount: amount, operations }

      /* simulation */
      const simulation = { simulate_swap_operations: swapOperations }
      const execute = { execute_swap_operations: swapOperations }

      /* msgs */
      const contract = fromNative ? contracts.routeswap : offerAsset
      const executeMsg = fromNative
        ? execute
        : { send: { contract, msg: toBase64(execute), amount } }
      const coins = fromNative ? [new Coin(offerAsset, amount)] : undefined
      const msgs = address
        ? [new MsgExecuteContract(address, contract, executeMsg, coins)]
        : []

      return { route, simulation, msgs }
    },
    [address, contracts?.routeswap, getIsOnchainAvailable]
  )

  const simulateRouteswap: SimulateFn<Token[]> = async (params: SwapParams) => {
    if (!contracts?.routeswap) throw new Error("Routeswap is not available")

    const { simulation, route } = getRouteswapParams(params)
    const { amount } = await lcd.wasm.contractQuery<{ amount: string }>(
      contracts.routeswap,
      simulation
    )

    return {
      mode: SwapMode.ROUTESWAP,
      query: params,
      result: { amount, payload: route },
    }
  }

  const getSimulateFunction = (mode: SwapMode) => {
    const simulationFunctions = {
      [SwapMode.ONCHAIN]: simulateOnchain,
      [SwapMode.TERRASWAP]: simulateTerraswap,
      [SwapMode.ROUTESWAP]: simulateRouteswap,
    }

    return simulationFunctions[mode]
  }

  const getMsgsFunction = useCallback(
    (mode: SwapMode) => {
      const getMsgs = {
        [SwapMode.ONCHAIN]: (params: SwapParams) =>
          getOnchainParams(params).msgs,
        [SwapMode.TERRASWAP]: (params: SwapParams) =>
          getTerraswapParams(params).msgs,
        [SwapMode.ROUTESWAP]: (params: SwapParams) =>
          getRouteswapParams(params).msgs,
      }

      return getMsgs[mode]
    },
    [getOnchainParams, getTerraswapParams, getRouteswapParams]
  )

  const getSimulateQuery = (params: Partial<SwapParams>) => ({
    queryKey: ["simulate.swap", params],
    queryFn: async () => {
      if (!validateParams(params)) throw new Error()
      const modes = getAvailableSwapModes(params)
      const functions = modes.map(getSimulateFunction)
      const queries = functions.map((fn) => fn(params))
      const responses = await Promise.allSettled(queries)
      const results = responses.map((result) => {
        if (result.status === "rejected") throw new Error(result.reason)
        return result.value
      })

      return {
        values: zipObj(modes, results),
        profitable: findProfitable(results),
      }
    },
    enabled: validateParams(params),
  })

  return {
    ...context,
    getIsSwapAvailable,
    getSwapMode,
    getAvailableSwapModes,
    getSimulateFunction,
    getSimulateQuery,
    getMsgsFunction,
  }
}

export default useSwapUtils

/* type guard */
export const validateAssets = (
  assets: Partial<SwapAssets>
): assets is Required<SwapAssets> => {
  const { offerAsset, askAsset } = assets
  return !!offerAsset && !!askAsset && offerAsset !== askAsset
}

export const validateParams = (
  params: Partial<SwapParams>
): params is SwapParams => {
  const { amount, ...assets } = params
  return has(amount) && validateAssets(assets)
}

/* determinant */
const getAssertRequired = ({ offerAsset, askAsset }: SwapAssets) =>
  [offerAsset, askAsset].some(isDenomTerra) &&
  [offerAsset, askAsset].some(isDenomLuna)

/* helpers */
const findProfitable = (results: SimulateResult[]) => {
  const index = results.reduce(
    (acc, { result }, index) =>
      new BigNumber(result.amount).gt(results[acc].result.amount) ? index : acc,
    0
  )

  return results[index]
}

/* calc */
export const calcBySlippage = (params: SlippageParams) => {
  const { input, simulated, slippageInput, offerDecimals, askDecimals } = params
  const amount = toAmount(input, { decimals: offerDecimals })
  const ratio = new BigNumber(amount).div(simulated)

  /* terraswap */
  const belief_price = ratio.dp(18, BigNumber.ROUND_DOWN).toString()

  /* routeswap | on-chain */
  const max_spread = new BigNumber(slippageInput).div(100).toString()
  const minimum_receive = calcMinimumReceive(simulated, max_spread)

  /* expected price */
  const decimals = askDecimals - offerDecimals
  const price = toPrice(ratio.times(new BigNumber(10).pow(decimals)))

  return { max_spread, belief_price, minimum_receive, price }
}

export const calcMinimumReceive = (
  simulatedValue: string,
  max_spread: string
) => {
  const minRatio = new BigNumber(1).minus(max_spread)
  const value = new BigNumber(simulatedValue).times(minRatio)
  return value.integerValue(BigNumber.ROUND_FLOOR).toString()
}
