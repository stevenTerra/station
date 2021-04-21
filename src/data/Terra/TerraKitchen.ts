import { useQuery } from "react-query"
import axios, { AxiosError } from "axios"
import { queryKey, RefetchOptions } from "../query"

const config = { baseURL: "https://assets.terra.kitchen" }

export enum Aggregate {
  PERIODIC = "periodic",
  CUMULATIVE = "cumulative",
}

export enum AggregateStakingReturn {
  DAILY = "daily",
  ANNUALIZED = "annualized",
}

export enum AggregateAccounts {
  TOTAL = "total",
  ACTIVE = "active",
}

export const useTerraKitchenAssets = (path: string) => {
  return useQuery<ChartDataItem[], AxiosError>(
    [queryKey.TerraKitchen, path],
    async () => {
      const { data } = await axios.get(path, config)
      return data
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useTxVolume = (denom: Denom, type: Aggregate) => {
  return useTerraKitchenAssets(`tx-volume/${denom}/${type}.json`)
}

export const useStakingReturn = (type: AggregateStakingReturn) => {
  return useTerraKitchenAssets(`staking-return/${type}.json`)
}

export const useTaxRewards = (type: Aggregate) => {
  return useTerraKitchenAssets(`tax-rewards/${type}.json`)
}

export const useAccounts = (
  accountsType: AggregateAccounts,
  type: Aggregate
) => {
  return useTerraKitchenAssets(`accounts/${accountsType}/${type}.json`)
}
