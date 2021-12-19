import { useTranslation } from "react-i18next"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { LinkButton } from "components/general"

const GoBack = () => {
  const { t } = useTranslation()
  const icon = <ArrowBackIcon fontSize="inherit" />

  return (
    <LinkButton to=".." icon={icon} size="small" block>
      {t("Go back")}
    </LinkButton>
  )
}

export default GoBack
