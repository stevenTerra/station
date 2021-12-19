import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import { truncate } from "@terra.kitchen/utils"
import { useWallet } from "@terra-money/wallet-provider"
import { Button, Copy, FinderLink } from "components/general"
import { Grid } from "components/layout"
import { Tooltip, Popover } from "components/display"
import { useAddress, useAuth } from "auth"
import SwitchAccount from "auth/modules/select/SwitchAccount"
import styles from "./Connected.module.scss"

const Connected = () => {
  const { t } = useTranslation()
  const { disconnect } = useWallet()
  const address = useAddress()
  const { user } = useAuth()

  if (!address) return null

  return (
    <Popover
      content={
        <div className={styles.component}>
          <Grid gap={12} className={styles.inner}>
            <section>
              <Tooltip content={t("View on Terra Finder")}>
                <FinderLink className={styles.link} short>
                  {address}
                </FinderLink>
              </Tooltip>

              <footer>
                <Copy text={address} />
              </footer>
            </section>

            <SwitchAccount />
          </Grid>

          {user ? (
            <Link to="/account" className={styles.footer}>
              {t("Manage account")}
            </Link>
          ) : (
            <button
              type="button"
              className={styles.footer}
              onClick={disconnect}
            >
              {t("Disconnect")}
            </button>
          )}
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
        {user?.name ?? truncate(address)}
      </Button>
    </Popover>
  )
}

export default Connected
