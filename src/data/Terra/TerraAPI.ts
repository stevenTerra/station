import { useMemo } from "react"
import { useQuery } from "react-query"
import axios, { AxiosError } from "axios"
import BigNumber from "bignumber.js"
import { OracleParams, ValAddress } from "@terra-money/terra.js"
import { TerraValidator } from "types/validator"
import { useOracleParams } from "data/queries/oracle"
import { queryKey, RefetchOptions } from "../query"
import { useAddress } from "data/wallet"

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

export const useTerraAPI = <T>(path: string, params?: any) => {
  return useQuery<T, AxiosError>(
    [queryKey.TerraAPI, path],
    async () => {
      const { data } = await axios.get(path, { ...config, params })
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

/* history */
export const useAccountHistory = (offset?: number) => {
  const address = useAddress()
  return useTerraAPI<AccountHistory>(`tx-history/${address}`, { offset })
}

/* validators */
export const useTerraValidators = () => {
  return useTerraAPI<TerraValidator[]>("validators")
}

export const useTerraValidator = (address: ValAddress) => {
  return useTerraAPI<TerraValidator>(`validators/${address}`)
}

/* helpers */
export const getCalcVotingPowerRate = (TerraValidators: TerraValidator[]) => {
  const total = BigNumber.sum(
    ...TerraValidators.map(({ voting_power = 0 }) => voting_power)
  ).toNumber()

  return (address: ValAddress) => {
    const validator = TerraValidators.find(
      ({ operator_address }) => operator_address === address
    )

    if (!validator) return
    const { voting_power } = validator
    return voting_power ? Number(validator.voting_power) / total : undefined
  }
}

export const calcSelfDelegation = (validator?: TerraValidator) => {
  if (!validator) return
  const { self, tokens } = validator
  return self ? Number(self) / Number(tokens) : undefined
}

export const getCalcUptime = ({ slash_window }: OracleParams) => {
  return (validator?: TerraValidator) => {
    if (!validator) return
    const { miss_counter } = validator
    return miss_counter ? 1 - Number(miss_counter) / slash_window : undefined
  }
}

export const useVotingPowerRate = (address: ValAddress) => {
  const { data: TerraValidators, ...state } = useTerraValidators()
  const calcRate = useMemo(() => {
    if (!TerraValidators) return
    return getCalcVotingPowerRate(TerraValidators)
  }, [TerraValidators])

  const data = useMemo(() => {
    if (!calcRate) return
    return calcRate(address)
  }, [address, calcRate])

  return { data, ...state }
}

export const useUptime = (validator: TerraValidator) => {
  const { data: oracleParams, ...state } = useOracleParams()

  const calc = useMemo(() => {
    if (!oracleParams) return
    return getCalcUptime(oracleParams)
  }, [oracleParams])

  const data = useMemo(() => {
    if (!calc) return
    return calc(validator)
  }, [calc, validator])

  return { data, ...state }
}
