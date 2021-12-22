import { useAccountHistory } from "data/Terra/TerraAPI"
import { Col } from "components/layout"
import { Empty } from "components/feedback"
import TxItem from "./TxItem"

const TxList = () => {
  const { data } = useAccountHistory()

  const render = () => {
    if (!data) return null
    const { list } = data
    return !list.length ? (
      <Empty />
    ) : (
      <Col>
        {list.map((item) => (
          <TxItem {...item} key={item.txhash} />
        ))}
      </Col>
    )
  }

  return <>{render()}</>
}

export default TxList
