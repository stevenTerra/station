import { useQuery } from "react-query"
import axios, { AxiosError } from "axios"
import { fromPairs, toPairs } from "ramda"
import { flatten, groupBy, map, mergeAll, values } from "ramda"
import { AccAddress } from "@terra-money/terra.js"
import shuffle from "utils/shuffle"
import { queryKey, RefetchOptions } from "../query"
import { useNetworkName } from "../wallet"

const config = { baseURL: "https://assets.terra.money" }

export const useTerraAssets = <T>(path: string, callback?: (data: T) => T) => {
  return useQuery<T, AxiosError>(
    [queryKey.TerraAssets, path],
    async () => {
      const { data } = await axios.get<T>(path, config)
      return callback?.(data) ?? data
    },
    { ...RefetchOptions.INFINITY }
  )
}

export const useTerraAssetsByNetwork = <T>(
  path: string,
  disabled = false,
  callback?: (data: T) => T
) => {
  const networkName = useNetworkName()
  return useQuery<T | undefined, AxiosError>(
    [queryKey.TerraAssets, path, networkName],
    async () => {
      const { data } = await axios.get<Record<NetworkName, T>>(path, config)
      return callback?.(data[networkName]) ?? data[networkName]
    },
    { ...RefetchOptions.INFINITY, enabled: !disabled }
  )
}

export const useIBCWhitelist = () => {
  return useTerraAssetsByNetwork<IBCTokens>("ibc/tokens.json")
}

export const useCW20Whitelist = (disabled = false) => {
  return useTerraAssetsByNetwork<CW20Whitelist>(
    "cw20/tokens.json",
    disabled,
    (data) => sortWhitelistCW20(shuffleByProtocol(data))
  )
}

export const useCW20Pairs = () => {
  return useTerraAssetsByNetwork<CW20Pairs>("cw20/pairs.json")
}

export type ContractNames = "assertLimitOrder" | "routeswap"
export type TerraContracts = Record<ContractNames, AccAddress>
export const useTerraContracts = () => {
  return useTerraAssetsByNetwork<TerraContracts>("contracts.json")
}

export const useCW721Whitelist = () => {
  return useTerraAssetsByNetwork<CW721Whitelist>(
    "cw721/contracts.json",
    undefined,
    shuffleByProtocol
  )
}

interface CW721MarketplaceItem {
  name: string
  link: string
}

export const useCW721Marketplace = () => {
  return useTerraAssets<CW721MarketplaceItem[]>("cw721/marketplace.json")
}

/* helpers */
const sortWhitelistCW20 = (data: CW20Whitelist) => {
  const sorted = toPairs(data)
    .sort(
      ([, { protocol: a }], [, { protocol: b }]) =>
        Number(b === "Mirror") - Number(a === "Mirror")
    )
    .sort(
      ([, { symbol: a }], [, { symbol: b }]) =>
        Number(b === "MIR") - Number(a === "MIR")
    )
    .sort(
      ([, { protocol: a }], [, { protocol: b }]) =>
        Number(b === "Anchor") - Number(a === "Anchor")
    )
    .sort(
      ([, { symbol: a }], [, { symbol: b }]) =>
        Number(b === "ANC") - Number(a === "ANC")
    )

  return fromPairs(
    sorted.map(([t, { decimals, ...item }]) => {
      return [t, { ...item, decimals: decimals ?? 6 }]
    })
  )
}

export const shuffleByProtocol = <T extends CW20Whitelist | CW721Whitelist>(
  array: T
) => {
  const shuffledPair = shuffle(
    toPairs(
      groupBy(([, { protocol, name }]) => protocol ?? name, toPairs(array))
    )
  )

  return mergeAll(flatten(map(fromPairs, values(fromPairs(shuffledPair)))))
}
