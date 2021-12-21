import { combineState } from "data/query"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { useRewards } from "data/queries/distribution"
import { Col, Row } from "components/layout"
import { Fetching } from "components/feedback"
import DelegationsPromote from "app/containers/DelegationsPromote"
import Delegations from "./Delegations"
import Unbondings from "./Unbondings"
import Rewards from "./Rewards"

const Staked = () => {
  const { data: delegations, ...delegationsResult } = useDelegations()
  const { data: unbondings, ...unbondingsResult } = useUnbondings()
  const { data: rewards, ...rewardsResult } = useRewards()
  const state = combineState(delegationsResult, unbondingsResult, rewardsResult)

  const render = () => {
    if (!(delegations && unbondings && rewards)) return null

    const staked =
      delegations.length || unbondings.length || rewards.total.toArray().length

    if (!staked) return <DelegationsPromote horizontal />

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
