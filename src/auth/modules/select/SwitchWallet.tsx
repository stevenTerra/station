import { useTranslation } from "react-i18next"
import { truncate } from "@terra.kitchen/utils"
import classNames from "classnames/bind"
import { Grid } from "components/layout"
import useAuth from "../../hooks/useAuth"
import styles from "./SwitchWallet.module.scss"

const cx = classNames.bind(styles)

const SwitchWallet = () => {
  const { t } = useTranslation()
  const { wallet, wallets, connect } = useAuth()

  return !wallets.length ? null : (
    <Grid gap={4}>
      <h1>{t("Wallets")}</h1>

      <ul className={styles.list}>
        {wallets.map(({ name, address }) => {
          const active = name === wallet?.name

          return (
            <li key={name}>
              <button
                className={cx(styles.wallet, { active })}
                onClick={() => connect(name)}
              >
                {name}
                <span className="muted">{truncate(address)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </Grid>
  )
}

export default SwitchWallet
