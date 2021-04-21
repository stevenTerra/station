import { FC } from "react"
import { Coins } from "@terra-money/terra.js"
import createContext from "utils/createContext"
import { combineState } from "data/query"
import { useActiveDenoms, useExchangeRates } from "data/queries/oracle"
import { TerraContracts } from "data/Terra/TerraAssets"
import { useCW20Pairs } from "data/Terra/TerraAssets"
import { useTerraContracts } from "data/Terra/TerraAssets"
import { Fetching } from "components/feedback"

interface Swap {
  activeDenoms: Denom[]
  exchangeRates: Coins
  pairs: CW20Pairs
  contracts?: TerraContracts
}

export const [useSwap, SwapProvider] = createContext<Swap>("useSwap")

const SwapContext: FC = ({ children }) => {
  const { data: activeDenoms, ...activeDenomsResult } = useActiveDenoms()
  const { data: exchangeRates, ...exchangeRatesResult } = useExchangeRates()
  const { data: pairs, ...cw20PairsResult } = useCW20Pairs()
  const { data: contracts, ...contractsResult } = useTerraContracts()

  const state = combineState(
    activeDenomsResult,
    exchangeRatesResult,
    contractsResult,
    cw20PairsResult
  )

  const render = () => {
    if (!(activeDenoms && exchangeRates && pairs && contracts)) return null
    const value = { activeDenoms, exchangeRates, pairs, contracts }
    return <SwapProvider value={value}>{children}</SwapProvider>
  }

  return !state.isSuccess ? null : <Fetching {...state}>{render()}</Fetching>
}

export default SwapContext
