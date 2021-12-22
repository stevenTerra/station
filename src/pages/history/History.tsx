import { useAddress } from "data/wallet"
import { Page } from "components/layout"
import { Empty } from "components/feedback"
import TxList from "./TxList"

const History = () => {
  const address = useAddress()

  return <Page title="History">{address ? <TxList /> : <Empty />}</Page>
}

export default History
