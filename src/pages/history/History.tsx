import { useAddress } from "data/wallet"
import { FinderLink } from "components/general"
import { Col, Page, Card } from "components/layout"
import { Wrong, Empty } from "components/feedback"

const History = () => {
  const address = useAddress()

  return (
    <Page title="History">
      <Col>
        <Card>
          <Wrong>Not implemented yet</Wrong>
          {address && <FinderLink value={address}>{address}</FinderLink>}
        </Card>

        <Card>
          <Empty />
        </Card>
      </Col>
    </Page>
  )
}

export default History
