import { useConnectedWallet } from "@terra-money/wallet-provider"
import useAuth from "./useAuth"

/* auth | walle-provider */
const useAddress = () => {
  const connected = useConnectedWallet()
  const { user } = useAuth()
  return user?.address ?? connected?.terraAddress
}

export default useAddress
