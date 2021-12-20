import { useQuery } from "react-query"
import axios from "axios"
import { queryKey, RefetchOptions } from "../query"
import { useFCD } from "../wallet"

export type GasPrices = Record<Denom, Amount>

export const useGasPrices = () => {
  const fcd = useFCD()

  return useQuery(
    [queryKey.fcd.gasPrices, fcd],
    async () => {
      const { data } = await axios.get<GasPrices>("/v1/txs/gas_prices", {
        baseURL: fcd,
      })

      return data
    },
    { ...RefetchOptions.INFINITY }
  )
}
