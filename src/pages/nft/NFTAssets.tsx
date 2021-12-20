import { useTranslation } from "react-i18next"
import { useAddress } from "data/wallet"
import { useCustomTokensCW721 } from "data/settings/CustomTokens"
import { InternalButton } from "components/general"
import { Col, Card } from "components/layout"
import { ModalButton } from "components/feedback"
import ManageCustomTokensCW721 from "../custom/ManageCustomTokensCW721"
import NFTPlaceholder from "./NFTPlaceholder"
import NFTAssetGroup from "./NFTAssetGroup"

const NFTAssets = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { list } = useCustomTokensCW721()
  const empty = !address || !list.length

  const extra = (
    <ModalButton
      title={t("NFT")}
      renderButton={(open) => (
        <InternalButton onClick={open} disabled={!address} chevron>
          {t("Add tokens")}
        </InternalButton>
      )}
    >
      <ManageCustomTokensCW721 />
    </ModalButton>
  )

  return (
    <Card extra={!empty && extra}>
      {empty ? (
        <NFTPlaceholder>{extra}</NFTPlaceholder>
      ) : (
        <Col>
          {list.map((item) => (
            <NFTAssetGroup {...item} key={item.contract} />
          ))}
        </Col>
      )}
    </Card>
  )
}

export default NFTAssets
