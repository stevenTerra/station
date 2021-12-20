import { useHistory } from "data/Terra/fcd"
import { Col, Page } from "components/layout"
import Tx from "./Tx"

const History = () => {
  const { data } = useHistory()

  const render = () => {
    if (!data) return null
    const { txs } = data
    return (
      <Col>
        {txs.map((tx) => (
          <Tx {...tx} key={tx.txhash} />
        ))}
      </Col>
    )
  }

  return <Page title="History">{render()}</Page>
}

export default History
