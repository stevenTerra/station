import { useDelegations } from "data/queries/staking"
import { Col, Row } from "components/layout"
import { Fetching } from "components/feedback"
import DelegationsPromote from "app/containers/DelegationsPromote"
import Delegations from "./Delegations"
import Unbondings from "./Unbondings"
import Rewards from "./Rewards"

const Staked = () => {
  const { data: delegations, ...state } = useDelegations()

  const render = () => {
    if (!delegations) return null
    if (!delegations.length) return <DelegationsPromote horizontal />

    return (
      <Row>
        <Col>
          <Delegations />
        </Col>

        <Col>
          <Unbondings />
        </Col>

        <Col>
          <Rewards />
        </Col>
      </Row>
    )
  }

  return <Fetching {...state}>{render()}</Fetching>
}

export default Staked
