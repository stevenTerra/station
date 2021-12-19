import { FC } from "react"
import { Auto, Card, Col } from "components/layout"
import SwitchWallet from "../select/SwitchWallet"
import GoBack from "./GoBack"

const ConnectedWallet: FC<{ index?: boolean }> = ({ index, children }) => {
  return (
    <Auto
      columns={[
        children,
        <Col>
          <Card>
            <SwitchWallet />
          </Card>
          {!index && <GoBack />}
        </Col>,
      ]}
    />
  )
}

export default ConnectedWallet
