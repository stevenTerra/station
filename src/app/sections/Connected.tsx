import { useTranslation } from "react-i18next"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import { truncate } from "@terra.kitchen/utils"
import { useWallet } from "@terra-money/wallet-provider"
import { useAddress } from "data/wallet"
import { Button, Copy, FinderLink } from "components/general"
import { Tooltip, Popover } from "components/display"
import styles from "./Connected.module.scss"

const Connected = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { disconnect } = useWallet()

  if (!address) return null

  return (
    <Popover
      content={
        <div className={styles.inner}>
          <section className={styles.address}>
            <Tooltip content={t("View on Terra Finder")}>
              <FinderLink className={styles.link} short>
                {address}
              </FinderLink>
            </Tooltip>
            <Copy text={address} />
          </section>

          <button
            type="button"
            className={styles.disconnect}
            onClick={disconnect}
          >
            {t("Disconnect")}
          </button>
        </div>
      }
      placement="bottom-end"
      theme="none"
    >
      <Button
        icon={<AccountBalanceWalletIcon style={{ fontSize: 16 }} />}
        size="small"
        outline
      >
        {truncate(address)}
      </Button>
    </Popover>
  )
}

export default Connected
