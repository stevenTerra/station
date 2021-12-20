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

export const useTerraAPI = (path: string) => {
  return useQuery<ChartDataItem[], AxiosError>(
    [queryKey.TerraAPI, path],
    async () => {
      const { data } = await axios.get(path, config)
      return data
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useTxVolume = (denom: Denom, type: Aggregate) => {
  return useTerraAPI(`chart/tx-volume/${denom}/${type}`)
}

export const useStakingReturn = (type: AggregateStakingReturn) => {
  return useTerraAPI(`chart/staking-return/${type}`)
}

export const useTaxRewards = (type: Aggregate) => {
  return useTerraAPI(`chart/tax-rewards/${type}`)
}

export const useWallets = (walletsType: AggregateWallets, type: Aggregate) => {
  return useTerraAPI(`chart/wallets/${walletsType}/${type}`)
}
