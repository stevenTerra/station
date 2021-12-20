import { useTerraAPI } from "./api"

export type GasPrices = Record<Denom, Amount>

export const useGasPrices = () => {
  return useTerraAPI<GasPrices>("/gas-prices")
}
