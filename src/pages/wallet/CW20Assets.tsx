import { useTranslation } from "react-i18next"
import { useAddress } from "data/wallet"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { InternalButton } from "components/general"
import { Card } from "components/layout"
import { ModalButton } from "components/feedback"
import ManageCustomTokensCW20 from "../wasm/ManageCustomTokensCW20"
import CW20Asset from "./CW20Asset"

const CW20Assets = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { list } = useCustomTokensCW20()

  return (
    <Card
      title={t("Tokens")}
      extra={
        <ModalButton
          title={t("Add/Remove token")}
          renderButton={(open) => (
            <InternalButton disabled={!address} onClick={open} chevron>
              {t("Add token")}
            </InternalButton>
          )}
        >
          <ManageCustomTokensCW20 />
        </ModalButton>
      }
    >
      {!list.length
        ? null
        : list.map((item) => <CW20Asset {...item} key={item.token} />)}
    </Card>
  )
}

export default CW20Assets
