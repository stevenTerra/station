/* Address book */
interface AddressBook {
  name: string
  recipient: string
  memo?: string
}

/* Preference */
interface Preference {
  hideSmallBalances?: boolean
}

/* Tokens */
type NetworkName = string
type CustomTokens = Record<NetworkName, CustomTokensByNetwork>

interface CustomTokensByNetwork {
  cw20: CW20TokenInfoResponse[]
  cw721: CW721ContractInfoResponse[]
}

type CustomToken = CustomTokenCW20 | CustomTokenCW721
interface CustomTokenCW20 extends CW20TokenInfoResponse {
  token: TerraAddress
}

interface CustomTokenCW721 extends CW721ContractInfoResponse {
  contract: TerraAddress
}
