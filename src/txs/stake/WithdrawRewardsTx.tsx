import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { useRewards } from "data/queries/distribution"
import { useDelegations, useValidators } from "data/queries/staking"
import { useIBCWhitelist } from "data/Terra/TerraAssets"
import { Page, Card } from "components/layout"
import DelegationsPromote from "app/containers/DelegationsPromote"
import TxContext from "../TxContext"
import WithdrawRewardsForm from "./WithdrawRewardsForm"

const WithdrawRewardsTx = () => {
  const { t } = useTranslation()

  const { data: rewards, ...rewardsResult } = useRewards()
  const { data: delegations, ...delegationsResult } = useDelegations()
  const { data: validators, ...validatorsResult } = useValidators()
  const { data: IBCWhitelist, ...IBCWhitelistResult } = useIBCWhitelist()

  const state = combineState(
    rewardsResult,
    delegationsResult,
    validatorsResult,
    IBCWhitelistResult
  )

  const render = () => {
    if (!(rewards && delegations && validators && IBCWhitelist)) return null

    const hasRewards = !!rewards.total.toArray().length
    const hasDelegations = !!delegations.length

    if (!hasRewards)
      return hasDelegations ? (
        <Card>{t("No rewards yet")}</Card>
      ) : (
        <DelegationsPromote />
      )

    return (
      <Card>
        <TxContext>
          <WithdrawRewardsForm
            rewards={rewards}
            validators={validators}
            IBCWhitelist={IBCWhitelist}
          />
        </TxContext>
      </Card>
    )
  }

  return (
    <Page {...state} title={t("Withdraw rewards")} small>
      {render()}
    </Page>
  )
}

export default WithdrawRewardsTx
