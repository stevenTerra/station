import { FC } from "react"
import { zipObj } from "ramda"
import createContext from "utils/createContext"
import { combineState } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { useTaxCaps, useTaxRate } from "data/queries/treasury"
import { TaxParams } from "../utils"

export const [useTaxParams, TaxParamsProvider] =
  createContext<TaxParams>("useTaxParams")

const TaxParamsContext: FC = ({ children }) => {
  const bankBalance = useBankBalance()

  const denoms = bankBalance.toArray().map(({ denom }) => denom) ?? []
  const { data: taxRate, ...taxRateResult } = useTaxRate()
  const taxCapsResults = useTaxCaps(denoms)
  const state = combineState(taxRateResult, ...taxCapsResults)

  if (!state.isSuccess || !taxRate) return null

  const taxCaps = zipObj(
    denoms,
    taxCapsResults.map(({ data }) => {
      if (!data) throw new Error()
      return data
    })
  )

  return (
    <TaxParamsProvider value={{ taxRate, taxCaps }}>
      {children}
    </TaxParamsProvider>
  )
}

export default TaxParamsContext
