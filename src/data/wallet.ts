import { useConnectedWallet, useWallet } from "@terra-money/wallet-provider"

export const useAddress = () => {
  const connectedWallet = useConnectedWallet()
  return connectedWallet?.terraAddress
}

export const useNetwork = () => {
  const { network } = useWallet()
  return network
}

export const useNetworkName = () => {
  const { network } = useWallet()
  return network.name
}

export const useChainID = () => {
  const { network } = useWallet()
  return network.chainID
}

export const useFCD = () => {
  const { network } = useWallet()
  return network.lcd.replace("lcd", "fcd")
}
