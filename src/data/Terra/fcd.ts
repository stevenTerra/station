import { useQuery } from "react-query"
import axios from "axios"
import { useWallet } from "@terra-money/wallet-provider"
import { AccountHistory } from "types/history"
import { queryKey, RefetchOptions } from "data/query"
import { useAddress } from "data/wallet"

export const useHistory = () => {
  const address = useAddress()
  const { network } = useWallet()
  const fcd = network.lcd.replace("lcd", "fcd")

  return useQuery(
    [queryKey.History, address],
    async () => {
      const { data } = await axios.get<AccountHistory>("/v1/txs", {
        baseURL: fcd,
        params: { account: address },
      })

      return data
    },
    { ...RefetchOptions.DEFAULT }
  )
}
