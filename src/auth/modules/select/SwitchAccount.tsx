import { useTranslation } from "react-i18next"
import { truncate } from "@terra.kitchen/utils"
import classNames from "classnames/bind"
import { Grid } from "components/layout"
import useAuth from "../../hooks/useAuth"
import styles from "./SwitchAccount.module.scss"

const cx = classNames.bind(styles)

const SwitchAccount = () => {
  const { t } = useTranslation()
  const { user, accounts, connect } = useAuth()

  return !accounts.length ? null : (
    <Grid gap={4}>
      <h1>{t("Accounts")}</h1>

      <ul className={styles.list}>
        {accounts.map(({ name, address }) => {
          const active = name === user?.name

          return (
            <li key={name}>
              <button
                className={cx(styles.account, { active })}
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

export default SwitchAccount
