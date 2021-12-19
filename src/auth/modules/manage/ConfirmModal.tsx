import { useTranslation } from "react-i18next"
import { Modal } from "components/feedback"
import { Submit } from "components/form"

interface Props {
  title: string
  onRequestClose: () => void
}

const ConfirmModal = ({ title, onRequestClose }: Props) => {
  const { t } = useTranslation()

  return (
    <Modal
      isOpen
      onRequestClose={onRequestClose}
      closeIcon={false}
      title={title}
      footer={(close) => (
        <Submit type="button" onClick={close}>
          {t("Confirm")}
        </Submit>
      )}
    />
  )
}

export default ConfirmModal
