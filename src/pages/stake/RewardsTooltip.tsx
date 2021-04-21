import { useTranslation } from "react-i18next"
import styles from "./RewardsTooltip.module.scss"

const RewardsTooltip = () => {
  const { t } = useTranslation()

  return (
    <article>
      <h1>
        {t(
          "The rewards will be automatically withdrawn in the following cases"
        )}
      </h1>

      <ul className={styles.list}>
        <li>
          {t("Delegating more to a validator you’ve already delegated to")}
        </li>
        <li>{t("Undelegation of assets")}</li>
        <li>{t("Redelegation of assets")}</li>
        <li>{t("Mainnet upgrade")}</li>
      </ul>

      <footer>
        {t(
          "This won’t appear in your transaction history, but your rewards will be reflected in your balance."
        )}
      </footer>
    </article>
  )
}

export default RewardsTooltip
