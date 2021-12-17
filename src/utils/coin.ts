import { Coins } from "@terra-money/terra.js"
import { isDenom, isDenomIBC } from "@terra.kitchen/utils"

/* coin */
export const getAmount = (coins: Coins, denom: Denom, fallback = "0") => {
  return coins.get(denom)?.amount.toString() ?? fallback
}

/* coins */
export const sortCoins = (
  coins: Coins,
  currency?: string,
  sorter?: (a: NativeCoin, b: NativeCoin) => number
) => {
  return sortByDenom(coins.toData(), currency, sorter)
}

export const sortByDenom = <T extends { denom: Denom }>(
  coins: T[],
  currency = "",
  sorter?: (a: T, b: T) => number
) =>
  coins
    .sort(sorter)
    .sort(({ denom: a }, { denom: b }) => compareIsDenomIBC(a, b))
    .sort(({ denom: a }, { denom: b }) => compareIs(currency)(a, b))
    .sort(({ denom: a }, { denom: b }) => compareIs("uusd")(a, b))
    .sort(({ denom: a }, { denom: b }) => compareIs("uluna")(a, b))

export const sortDenoms = (denoms: Denom[], currency = "") =>
  denoms
    .sort((a, b) => compareIsDenomIBC(a, b))
    .sort((a, b) => compareIs(currency)(a, b))
    .sort((a, b) => compareIs("uusd")(a, b))
    .sort((a, b) => compareIs("uluna")(a, b))

export const compareIsDenomIBC = (a: string, b: string) =>
  Number(isDenomIBC(a)) - Number(isDenomIBC(b))

export const compareIs = (k: string) => (a: string, b: string) =>
  Number(b === k) - Number(a === k)

/* cw20 */
export const toAssetInfo = (token: string) => {
  return isDenom(token)
    ? { native_token: { denom: token } }
    : { token: { contract_addr: token } }
}

export const toAsset = (token: Token, amount: Amount) => {
  return { amount, info: toAssetInfo(token) }
}

const toToken = (info: AssetInfo) => {
  return "native_token" in info
    ? info.native_token.denom
    : info.token.contract_addr
}

export const toTokenItem = ({ amount, info }: Asset) => {
  return { amount, token: toToken(info) }
}
