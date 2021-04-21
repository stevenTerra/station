import { Proposal } from "@terra-money/terra.js"
import { Grid } from "components/layout"
import ProposalDeposits from "./ProposalDeposits"
import ProposalVotes from "./ProposalVotes"
import ProposalHeader from "./ProposalHeader"
import styles from "./ProposalItem.module.scss"

const ProposalItem = ({ proposal }: { proposal: Proposal }) => {
  const { id, status } = proposal

  return (
    <Grid gap={36} className={styles.item}>
      <ProposalHeader proposal={proposal} />

      {status === Proposal.Status.PROPOSAL_STATUS_DEPOSIT_PERIOD ? (
        <ProposalDeposits id={id} />
      ) : status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD ? (
        <ProposalVotes id={id} />
      ) : null}
    </Grid>
  )
}

export default ProposalItem
