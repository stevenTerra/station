import { reverse } from "ramda"
import { Proposal } from "@terra-money/terra.js"
import ERROR from "config/ERROR"
import { useProposals } from "data/queries/gov"
import { Col, Card } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import ProposalItem from "./ProposalItem"
import GovernanceParams from "./GovernanceParams"
import styles from "./ProposalsByStatus.module.scss"

const ProposalsByStatus = ({ status }: { status: Proposal.Status }) => {
  const { data: proposals, ...state } = useProposals(status)

  const render = () => {
    if (!proposals) return null

    return !proposals.length ? (
      <Col>
        <Card>
          <Empty>{ERROR.GOV.EMPTY}</Empty>
        </Card>
        <GovernanceParams />
      </Col>
    ) : (
      <Col>
        <section className={styles.list}>
          {reverse(proposals).map((item) => (
            <Card
              to={`/proposal/${item.id}`}
              className={styles.link}
              key={item.id}
            >
              <ProposalItem proposal={item} />
            </Card>
          ))}
        </section>

        <GovernanceParams />
      </Col>
    )
  }

  return <Fetching {...state}>{render()}</Fetching>
}

export default ProposalsByStatus
