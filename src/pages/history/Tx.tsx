import { useTranslation } from "react-i18next"
import { AccountHistoryItem } from "types/history"
import { FinderLink } from "components/general"
import { Card, Flex } from "components/layout"
import { ToNow } from "components/display"
import { Read } from "components/token"
// import styles from "./Tx.module.scss"

const Tx = ({ txhash, timestamp, tx, ...props }: AccountHistoryItem) => {
  const { t } = useTranslation()
  const { fee, memo } = tx.value

  return (
    <Card
      title={<FinderLink short>{txhash}</FinderLink>}
      extra={<ToNow>{new Date(timestamp)}</ToNow>}
      size="small"
      bordered
    >
      <Flex gap={20} start>
        {t("Fee")}
        <Flex gap={4} start>
          {fee.amount.map((coin) => (
            <Read {...coin} key={coin.denom} />
          ))}
        </Flex>
      </Flex>

      {memo && (
        <Flex gap={20} start>
          {t("Memo")}
          <p>{memo}</p>
        </Flex>
      )}
    </Card>
  )
}

export default Tx
