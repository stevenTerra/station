import { last } from "ramda"
import { sentenceCase } from "sentence-case"
import { Flex } from "components/layout"
import { Tag } from "components/display"
import TxMessage from "app/containers/TxMessage"
import styles from "./TxMsg.module.scss"

const TxMsg = ({ success, msg }: { success: boolean; msg: TxMessage }) => {
  const { msgType, canonicalMsg } = msg
  const type = last(msgType.split("/"))

  return (
    <Flex gap={12} start>
      {type && (
        <Tag color={success ? "info" : "danger"} small>
          {sentenceCase(type)}
        </Tag>
      )}

      <section>
        {canonicalMsg.map((text) => (
          <TxMessage className={styles.message} key={text}>
            {text}
          </TxMessage>
        ))}
      </section>
    </Flex>
  )
}

export default TxMsg
