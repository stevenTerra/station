import { FC, useMemo } from "react"
import { flatten, uniq, zipObj } from "ramda"
import { isDenomIBC } from "@terra.kitchen/utils"
import { AccAddress } from "@terra-money/terra.js"
import { getAmount, sortDenoms } from "utils/coin"
import createContext from "utils/createContext"
import { useCurrency } from "data/settings/Currency"
import { combineState } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { useTokenBalances } from "data/queries/wasm"
import { readIBCDenom, readNativeDenom } from "data/token"
import { useIBCWhitelist } from "data/Terra/TerraAssets"
import { useCW20Whitelist } from "data/Terra/TerraAssets"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { Card } from "components/layout"
import { useSwap } from "./SwapContext"

interface SingleSwap {
  findTokenItem: (token: Token) => TokenItemWithBalance
  findDecimals: (token: Token) => number
  options: {
    native: TokenItemWithBalance[]
    ibc: TokenItemWithBalance[]
    cw20: TokenItemWithBalance[]
  }
}

export const [useSingleSwap, SingleSwapProvider] =
  createContext<SingleSwap>("useSingleSwap")

const SingleSwapContext: FC = ({ children }) => {
  const currency = useCurrency()
  const bankBalance = useBankBalance()
  const { activeDenoms, pairs } = useSwap()
  const { list } = useCustomTokensCW20()
  const customTokens = list.map(({ token }) => token)

  /* contracts */
  const { data: ibcWhitelist, ...ibcWhitelistResult } = useIBCWhitelist()
  const { data: cw20Whitelist, ...cw20WhitelistResult } = useCW20Whitelist()

  // Why?
  // To search tokens with symbol (ibc, cw20)
  // To filter tokens with balance (cw20)
  const terraswapAvailableList = useMemo(() => {
    if (!(ibcWhitelist && cw20Whitelist)) return

    const terraswapAvailableList = uniq(flatten(Object.values(pairs)))

    const ibc = terraswapAvailableList
      .filter(isDenomIBC)
      .filter((denom) => ibcWhitelist[denom.replace("ibc/", "")])

    const cw20 = terraswapAvailableList
      .filter(AccAddress.validate)
      .filter((token) => cw20Whitelist[token])

    return { ibc, cw20 }
  }, [cw20Whitelist, ibcWhitelist, pairs])

  // Fetch cw20 balances: only listed and added by the user
  const cw20TokensBalanceRequired = useMemo(() => {
    if (!terraswapAvailableList) return []
    return customTokens.filter((token) =>
      terraswapAvailableList.cw20.includes(token)
    )
  }, [customTokens, terraswapAvailableList])

  const cw20TokensBalancesResults = useTokenBalances(cw20TokensBalanceRequired)
  const cw20TokensBalances = useMemo(() => {
    if (cw20TokensBalancesResults.some(({ isSuccess }) => !isSuccess)) return

    return zipObj(
      cw20TokensBalanceRequired,
      cw20TokensBalancesResults.map(({ data }) => {
        if (!data) throw new Error()
        return data
      })
    )
  }, [cw20TokensBalanceRequired, cw20TokensBalancesResults])

  const context = useMemo(() => {
    if (!(terraswapAvailableList && ibcWhitelist && cw20Whitelist)) return
    if (!cw20TokensBalances) return

    const native = sortDenoms(activeDenoms, currency).map((denom) => {
      const balance = getAmount(bankBalance, denom)
      return { ...readNativeDenom(denom), balance }
    })

    const ibc = terraswapAvailableList.ibc.map((denom) => {
      const { base_denom } = ibcWhitelist[denom.replace("ibc/", "")]
      const balance = getAmount(bankBalance, denom)
      return { ...readIBCDenom(denom, base_denom), balance }
    })

    const cw20 = terraswapAvailableList.cw20.map((token) => {
      const balance = cw20TokensBalances[token] ?? "0"
      return { ...cw20Whitelist[token], balance }
    })

    const options = { native, ibc, cw20 }

    const findTokenItem = (token: Token) => {
      const key = AccAddress.validate(token)
        ? "cw20"
        : isDenomIBC(token)
        ? "ibc"
        : "native"

      const option = options[key].find((item) => item.token === token)
      if (!option) throw new Error()
      return option
    }

    const findDecimals = (token: Token) => findTokenItem(token).decimals

    return { options, findTokenItem, findDecimals }
  }, [
    currency,
    bankBalance,
    activeDenoms,
    ibcWhitelist,
    cw20Whitelist,
    terraswapAvailableList,
    cw20TokensBalances,
  ])

  const state = combineState(
    ibcWhitelistResult,
    cw20WhitelistResult,
    ...cw20TokensBalancesResults
  )

  const render = () => {
    if (!context) return null
    return <SingleSwapProvider value={context}>{children}</SingleSwapProvider>
  }

  return <Card {...state}>{render()}</Card>
}

export default SingleSwapContext
