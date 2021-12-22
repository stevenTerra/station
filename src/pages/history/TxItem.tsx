import { useTranslation } from "react-i18next"
import { FinderLink } from "components/general"
import { Card, Flex } from "components/layout"
import { ToNow } from "components/display"
import { Read } from "components/token"
import TxMsg from "./TxMsg"
// import styles from "./Tx.module.scss"

const TxItem = ({ txhash, timestamp, ...props }: AccountHistoryItem) => {
  const { success, msgs, fee, memo, raw_log } = props
  const { t } = useTranslation()

  return (
    <Card
      title={<FinderLink short>{txhash}</FinderLink>}
      extra={<ToNow>{new Date(timestamp)}</ToNow>}
      size="small"
      bordered
    >
      {msgs?.map((msg, index) => (
        <TxMsg msg={msg} success={success} key={index} />
      ))}

      <Flex gap={20} start>
        {t("Fee")}
        <Flex gap={4} start>
          {fee.map((coin) => (
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

      {!success && (
        <Flex gap={20} start>
          {t("Log")}
          <p>{raw_log}</p>
        </Flex>
      )}
    </Card>
  )
}

export default TxItem
