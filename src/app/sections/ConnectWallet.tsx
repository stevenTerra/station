import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { ConnectType, useWallet } from "@terra-money/wallet-provider"
import { useAddress } from "data/wallet"
import { Button } from "components/general"
import { List } from "components/display"
import { ModalButton } from "components/feedback"
import Connected from "./Connected"

interface Props {
  renderButton?: (open: () => void) => ReactNode
}

const ConnectWallet = ({ renderButton }: Props) => {
  const { t } = useTranslation()

  const { connect, availableConnections, availableInstallTypes, install } =
    useWallet()

  const address = useAddress()
  if (address) return <Connected />

  const defaultRenderButton: Props["renderButton"] = (open) => (
    <Button onClick={open} size="small" outline>
      {t("Connect")}
    </Button>
  )

  return (
    <ModalButton
      title={t("Connect to a wallet")}
      renderButton={renderButton ?? defaultRenderButton}
    >
      <List
        list={[
          ...availableConnections.map(({ type, identifier, name, icon }) => ({
            src: icon,
            children: name,
            onClick: () => connect(type, identifier),
          })),
          ...availableInstallTypes
            .filter((type) => type === ConnectType.EXTENSION)
            .map((type) => ({
              children: t("Install extension to generate a wallet"),
              onClick: () => install(type),
            })),
        ]}
      />
    </ModalButton>
  )
}

export default ConnectWallet
