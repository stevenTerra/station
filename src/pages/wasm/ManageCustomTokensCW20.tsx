import { AccAddress } from "@terra-money/terra.js"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { useCW20Whitelist } from "data/Terra/TerraAssets"
import { useTokenInfoCW20 } from "data/queries/wasm"
import { Fetching } from "components/feedback"
import WithSearchInput from "./WithSearchInput"
import CWTokenList from "./CWTokenList"

interface Props {
  whitelist: CW20Whitelist
  keyword: string
}

const Component = ({ whitelist, keyword }: Props) => {
  const manage = useCustomTokensCW20()

  type Added = Record<TerraAddress, CustomTokenCW20>
  const added = manage.list.reduce<Added>(
    (acc, item) => ({ ...acc, [item.token]: item }),
    {}
  )

  const merged = { ...added, ...whitelist }

  // if listed
  const listedItem = merged[keyword]

  // if not listed
  const { data: tokenInfo, ...state } = useTokenInfoCW20(
    !listedItem ? keyword : ""
  )

  const responseItem = tokenInfo ? { token: keyword, ...tokenInfo } : undefined

  // conclusion
  const result = listedItem ?? responseItem

  const results = AccAddress.validate(keyword)
    ? result
      ? [result]
      : []
    : Object.values(merged).filter(({ name, symbol }) =>
        [symbol, name].some((word) =>
          word?.toLowerCase().includes(keyword.toLowerCase())
        )
      )

  return (
    <CWTokenList
      {...state}
      {...manage}
      results={results}
      renderTokenItem={({ token, symbol, ...rest }) => {
        return { ...rest, contract: token, title: symbol }
      }}
    />
  )
}

const ManageCustomTokensCW20 = () => {
  const { data: whitelist, ...state } = useCW20Whitelist()

  return (
    <Fetching {...state} height={2}>
      {whitelist && (
        <WithSearchInput>
          {(input) => <Component whitelist={whitelist} keyword={input} />}
        </WithSearchInput>
      )}
    </Fetching>
  )
}

export default ManageCustomTokensCW20
