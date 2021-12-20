import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { Col, Page } from "components/layout"
import useAuth from "../../hooks/useAuth"
import ConnectedWallet from "./ConnectedWallet"
import styles from "./ManageWallets.module.scss"

const ManageWallets = () => {
  const { t } = useTranslation()
  const { wallet, available } = useAuth()

  const list = [
    { to: "./export", children: t("Export wallet") },
    { to: "./password", children: t("Change password") },
    { to: "./delete", children: t("Delete wallet") },
    { to: "./disconnect", children: t("Disconnect") },
  ]

  const renderItem = ({ to, children }: { to: string; children: string }) => {
    return (
      <Link to={to} className={styles.link} key={to}>
        {children}
        <ArrowForwardIosIcon fontSize="inherit" />
      </Link>
    )
  }

  return (
    <Page title={t("Manage wallet")}>
      <Col>
        {wallet && (
          <ConnectedWallet index>
            <div className={styles.list}>{list.map(renderItem)}</div>
          </ConnectedWallet>
        )}

        {!!available.length && (
          <div className={styles.list}>{available.map(renderItem)}</div>
        )}
      </Col>
    </Page>
  )
}
export default ManageWallets