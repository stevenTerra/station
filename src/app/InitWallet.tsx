import { FC, useMemo } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { useWallet, WalletStatus } from "@terra-money/wallet-provider"
import Splash from "auth/modules/Splash"

const InitWallet: FC = ({ children }) => {
  const { status } = useWallet()
  const queryClient = useQueryClient()

  return status === WalletStatus.INITIALIZING ? (
    <Splash />
  ) : (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default InitWallet

/* hooks */
const useQueryClient = () => {
  const { network } = useWallet()
  const { name } = network

  return useMemo(() => {
    if (!name) throw new Error()
    return new QueryClient()
  }, [name])
}
