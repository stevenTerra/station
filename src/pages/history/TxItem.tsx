import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { readAmount, readDenom } from "@terra.kitchen/utils"
import { FinderLink } from "components/general"
import { Card } from "components/layout"
import { Dl, ToNow } from "components/display"
import TxMsg from "./TxMsg"
import styles from "./TxItem.module.scss"

const TxItem = ({ txhash, timestamp, ...props }: AccountHistoryItem) => {
  const { success, msgs, fee, memo, raw_log } = props
  const { t } = useTranslation()

  const renderCoin = ({ amount, denom }: CoinData) => {
    return [readAmount(amount), readDenom(denom)].join(" ")
  }

  const data = [
    { title: t("Fee"), content: fee.map(renderCoin).join(", ") },
    { title: t("Memo"), memo },
    { title: t("Log"), content: !success && raw_log },
  ]

  return (
    <Card
      title={
        <FinderLink tx short>
          {txhash}
        </FinderLink>
      }
      extra={<ToNow>{new Date(timestamp)}</ToNow>}
      size="small"
      bordered
    >
      {msgs?.map((msg, index) => (
        <TxMsg msg={msg} success={success} key={index} />
      ))}

      <footer className={styles.footer}>
        <Dl>
          {data.map(({ title, content }) => {
            if (!content) return null
            return (
              <Fragment key={title}>
                <dt>{title}</dt>
                <dd>{content}</dd>
              </Fragment>
            )
          })}
        </Dl>
      </footer>
    </Card>
  )
}

export default TxItem
