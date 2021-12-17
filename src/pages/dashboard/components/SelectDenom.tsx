import { useTranslation } from "react-i18next"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { WithTokenItem } from "data/token"
import { ModalButton } from "components/feedback"
import { TokenCard, TokenCardGrid } from "components/token"
import styles from "./SelectDenom.module.scss"

interface Item extends NativeCoin {
  value?: Value
}

interface Props {
  title: string
  list: Item[]
}

const SelectDenom = ({ title, list }: Props) => {
  const { t } = useTranslation()

  return (
    <ModalButton
      title={title}
      renderButton={(open) => (
        <button className={styles.button} onClick={open}>
          {t("Show all")}
        </button>
      )}
    >
      <TokenCardGrid maxHeight>
        {list
          .filter(({ denom }) => isDenomTerraNative(denom))
          .map(({ amount, denom, value }) => (
            <WithTokenItem token={denom} key={denom}>
              {(item) => (
                <TokenCard
                  {...item}
                  amount={amount}
                  value={value}
                  valueConfig={{ prefix: true }}
                  name="" // remove name
                  prefix
                />
              )}
            </WithTokenItem>
          ))}
      </TokenCardGrid>
    </ModalButton>
  )
}

export default SelectDenom
