import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import AddIcon from "@mui/icons-material/Add"
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined"
import { useAddressBook } from "data/settings/AddressBook"
import { InternalButton } from "components/general"
import { Card } from "components/layout"
import { Empty, ModalButton } from "components/feedback"
import AddressBookItem from "./AddressBookItem"
import AddAddressBookItem from "./AddAddressBookItem"

interface Props {
  onClick: (item: AddressBook) => void
}

const AddressBookList = ({ onClick }: Props) => {
  const { t } = useTranslation()
  const { list } = useAddressBook()

  const renderModalButton = (renderButton: (open: () => void) => ReactNode) => (
    <ModalButton title={t("Add a new address")} renderButton={renderButton}>
      <AddAddressBookItem />
    </ModalButton>
  )

  return (
    <Card
      title={t("Address book")}
      extra={renderModalButton((open) => (
        <button type="button" onClick={open}>
          <AddIcon />
        </button>
      ))}
    >
      {!list.length ? (
        <Empty icon={<PersonAddOutlinedIcon fontSize="inherit" />}>
          {renderModalButton((open) => (
            <InternalButton onClick={open}>
              {t("Add an address")}
            </InternalButton>
          ))}
        </Empty>
      ) : (
        list.map((item) => (
          <AddressBookItem
            {...item}
            onClick={() => onClick(item)}
            key={item.name}
          />
        ))
      )}
    </Card>
  )
}

export default AddressBookList
