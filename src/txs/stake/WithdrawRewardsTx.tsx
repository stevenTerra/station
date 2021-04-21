import { useTranslation } from "react-i18next"
import ERROR from "config/ERROR"
import { combineState } from "data/query"
import { useExchangeRates } from "data/queries/oracle"
import { useRewards } from "data/queries/distribution"
import { useDelegations, useValidators } from "data/queries/staking"
import { Page, Card } from "components/layout"
import DelegationsPromote from "app/containers/DelegationsPromote"
import TxContext from "../TxContext"
import WithdrawRewardsForm from "./WithdrawRewardsForm"

const WithdrawRewardsTx = () => {
  const { t } = useTranslation()

  const { data: rewards, ...rewardsResult } = useRewards()
  const { data: delegations, ...delegationsResult } = useDelegations()
  const { data: validators, ...validatorsResult } = useValidators()
  const { data: exchangeRates, ...exchangeRatesResult } = useExchangeRates()

  const state = combineState(
    rewardsResult,
    delegationsResult,
    validatorsResult,
    exchangeRatesResult
  )

  const render = () => {
    if (!(rewards && delegations && validators && exchangeRates)) return null

    const hasRewards = !!rewards.total.toArray().length
    const hasDelegations = !!delegations.length

    if (!hasRewards)
      return hasDelegations ? (
        <Card>{ERROR.STAKE.REWARDS_EMPTY}</Card>
      ) : (
        <DelegationsPromote />
      )

    return (
      <Card>
        <TxContext>
          <WithdrawRewardsForm
            rewards={rewards}
            validators={validators}
            exchangeRates={exchangeRates}
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
