import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import { Button } from "components/general"
import useAuth from "../../hooks/useAuth"
import { useCreateWallet } from "./CreateWalletWizard"

const CreatedWallet = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connect } = useAuth()
  const { createdWallet: createdUser } = useCreateWallet()

  if (!createdUser) return null
  const { name, address } = createdUser

  const submit = () => {
    connect(name)
    navigate("/wallet", { replace: true })
  }

  return (
    <article>
      <header>
        <DoneAllIcon fontSize="large" />
        <h1>{t("Wallet generated successfully")}</h1>
      </header>

      <section>
        <h2>{t("Name")}</h2>
        <p>{name}</p>
      </section>

      <section>
        <h2>{t("Address")}</h2>
        <p>{address}</p>
      </section>

      <Button onClick={submit} color="primary" block>
        {t("Connect")}
      </Button>
    </article>
  )
}

export default CreatedWallet
