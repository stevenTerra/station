import { useQueries, useQuery } from "react-query"
import { AccAddress } from "@terra-money/terra.js"
import { queryKey, RefetchOptions } from "../query"
import { useAddress } from "../wallet"
import { useLCDClient } from "../Terra/lcdClient"

/* contract info */
export const useContractInfo = (address: TerraAddress) => {
  const lcd = useLCDClient()
  return useQuery(
    [queryKey.wasm.contractInfo, address],
    () => lcd.wasm.contractInfo(address),
    { ...RefetchOptions.INFINITY, enabled: AccAddress.validate(address) }
  )
}

export const useInitMsg = <T>(address: TerraAddress) => {
  const lcd = useLCDClient()
  return useQuery<T>(
    [queryKey.wasm.contractInfo, "initMsg", address],
    async () => {
      const d = await lcd.wasm.contractInfo(address)
      return d.init_msg
    },
    { ...RefetchOptions.INFINITY, enabled: AccAddress.validate(address) }
  )
}

/* contract query */
export const useGetContractQuery = () => {
  const lcd = useLCDClient()

  return <T>(contract: AccAddress, query: object) => ({
    queryKey: [queryKey.wasm.contractQuery, contract, query],
    queryFn: () => lcd.wasm.contractQuery<T>(contract, query),
    enabled: AccAddress.validate(contract),
  })
}

/* token info */
export const useTokenInfoCW20 = (token: TerraAddress, disabled = false) => {
  const getQuery = useGetContractQuery()
  return useQuery({
    ...getQuery<CW20TokenInfoResponse>(token, { token_info: {} }),
    ...RefetchOptions.INFINITY,
    enabled: AccAddress.validate(token) && !disabled,
  })
}

export const useTokenInfoCW721 = (contract: AccAddress, token_id: string) => {
  const getQuery = useGetContractQuery()
  return useQuery({
    ...getQuery<NFTTokenItem>(contract, { nft_info: { token_id } }),
    ...RefetchOptions.INFINITY,
  })
}

/* token balance */
const useGetTokenBalanceQuery = () => {
  const address = useAddress()
  const lcd = useLCDClient()

  return (token: AccAddress) => ({
    queryKey: [queryKey.wasm.contractQuery, token, { balance: address }],
    queryFn: async () => {
      if (!address) return "0"
      const { balance } = await lcd.wasm.contractQuery<{ balance: Amount }>(
        token,
        { balance: { address } }
      )

      return balance
    },
    ...RefetchOptions.DEFAULT,
    retry: false, // Tokens that are not implemented fail to get the balance.
    enabled: AccAddress.validate(token),
  })
}

export const useTokenBalance = (token: AccAddress) => {
  const getQuery = useGetTokenBalanceQuery()
  return useQuery(getQuery(token))
}

export const useTokenBalances = (tokens: AccAddress[]) => {
  const getQuery = useGetTokenBalanceQuery()
  return useQueries(tokens.map(getQuery))
}

export const useCW721Tokens = (contract: AccAddress) => {
  const address = useAddress()
  const getQuery = useGetContractQuery()

  return useQuery(
    getQuery<{ tokens: string[] }>(contract, { tokens: { owner: address } })
  )
}