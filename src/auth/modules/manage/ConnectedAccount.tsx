import { FC } from "react"
import { Auto, Card, Col } from "components/layout"
import SwitchAccount from "../select/SwitchAccount"
import GoBack from "./GoBack"

const ConnectedAccount: FC<{ index?: boolean }> = ({ index, children }) => {
  return (
    <Auto
      columns={[
        children,
        <Col>
          <Card>
            <SwitchAccount />
          </Card>
          {!index && <GoBack />}
        </Col>,
      ]}
    />
  )
}

export default ConnectedAccount
