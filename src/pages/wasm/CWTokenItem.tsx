import { isNil } from "ramda"
import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import AddIcon from "@mui/icons-material/Add"
import CheckIcon from "@mui/icons-material/Check"
import { truncate } from "@terra.kitchen/utils"
import { FinderLink } from "components/general"
import { Token } from "components/token"
import styles from "./CWTokenItem.module.scss"

const cx = classNames.bind(styles)

export interface CWTokenItemProps {
  contract: TerraAddress
  title: string // symbol(cw20) | name(cw721)
  icon?: string
  decimals?: number
}

interface Props extends CWTokenItemProps {
  added: boolean
  onAdd: () => void
  onRemove: () => void
}

const CWTokenItem = ({ added, onAdd, onRemove, ...props }: Props) => {
  const { contract, decimals, ...rest } = props
  const { t } = useTranslation()

  return (
    <Token
      {...rest}
      className={styles.item}
      token={contract}
      description={
        <FinderLink value={contract}>
          {truncate(contract)}
          {!isNil(decimals) && `(${t("decimals")}: ${decimals ?? "6"})`}
        </FinderLink>
      }
      extra={
        <button
          type="button"
          className={cx(styles.button, { added })}
          onClick={added ? onRemove : onAdd}
        >
          {added ? (
            <CheckIcon style={{ fontSize: 16 }} />
          ) : (
            <AddIcon style={{ fontSize: 16 }} />
          )}
        </button>
      }
    />
  )
}

export default CWTokenItem
