import { FC } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { useWallet, WalletStatus } from "@terra-money/wallet-provider"

const InitWallet: FC = ({ children }) => {
  const { status, network } = useWallet()
  const queryClient = new QueryClient()

  return status === WalletStatus.INITIALIZING ? null : (
    <QueryClientProvider client={queryClient} key={network.name}>
      {children}
    </QueryClientProvider>
  )
}

export default InitWallet
