import { useQuery } from "react-query"
import axios, { AxiosError } from "axios"
import { queryKey, RefetchOptions } from "../query"

const config = { baseURL: "https://api.terra.dev" }

export enum Aggregate {
  PERIODIC = "periodic",
  CUMULATIVE = "cumulative",
}

export enum AggregateStakingReturn {
  DAILY = "daily",
  ANNUALIZED = "annualized",
}

export enum AggregateWallets {
  TOTAL = "total",
  ACTIVE = "active",
}

export const useTerraAPI = <T>(path: string) => {
  return useQuery<T, AxiosError>(
    [queryKey.TerraAPI, path],
    async () => {
      const { data } = await axios.get(path, config)
      return data
    },
    { ...RefetchOptions.INFINITY }
  )
}

/* fee */
export type GasPrices = Record<Denom, Amount>

export const useGasPrices = () => {
  return useTerraAPI<GasPrices>("/gas-prices")
}

/* charts */
export const useTxVolume = (denom: Denom, type: Aggregate) => {
  return useTerraAPI<ChartDataItem[]>(`chart/tx-volume/${denom}/${type}`)
}

export const useStakingReturn = (type: AggregateStakingReturn) => {
  return useTerraAPI<ChartDataItem[]>(`chart/staking-return/${type}`)
}

export const useTaxRewards = (type: Aggregate) => {
  return useTerraAPI<ChartDataItem[]>(`chart/tax-rewards/${type}`)
}

export const useWallets = (walletsType: AggregateWallets, type: Aggregate) => {
  return useTerraAPI<ChartDataItem[]>(`chart/wallets/${walletsType}/${type}`)
}
