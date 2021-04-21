import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ValAddress } from "@terra-money/terra.js"
import { has } from "utils/num"
import { useCurrency } from "data/settings/Currency"
import { useBankBalance } from "data/queries/bank"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { calcDelegationsTotal } from "data/queries/staking"
import { useDelegations } from "data/queries/staking"
import { getAvailableStakeActions } from "data/queries/staking"
import { calcRewardsValues, useRewards } from "data/queries/distribution"
import { LinkButton } from "components/general"
import { Col, Card, ExtraActions, Grid } from "components/layout"
import { Read } from "components/token"
import { StakeAction } from "txs/stake/StakeForm"
import styles from "./ValidatorActions.module.scss"

const ValidatorActions = ({ destination }: { destination: ValAddress }) => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const bankBalance = useBankBalance()
  const { data: delegations, ...delegationState } = useDelegations()
  const { data: rewards, ...rewardsState } = useRewards()
  const calcValue = useMemoizedCalcValue()

  const label = {
    [StakeAction.DELEGATE]: t("Delegate"),
    [StakeAction.REDELEGATE]: t("Redelegate"),
    [StakeAction.UNBOND]: t("Undelegate"),
  }

  const renderDelegationsValue = () => {
    if (!delegations) return null
    const total = calcDelegationsTotal(delegations)
    const value = calcValue({ amount: total, denom: "uluna" })
    return (
      <section>
        <Read amount={total} denom="uluna" className={styles.total} block />
        {currency !== "uluna" && (
          <Read
            amount={value}
            denom={currency}
            className="muted"
            auto
            approx
            block
          />
        )}
      </section>
    )
  }

  const renderDelegationsActions = () => {
    if (!delegations) return

    const availableActions = getAvailableStakeActions(
      destination,
      delegations,
      bankBalance
    )

    return (
      <ExtraActions align="stretch">
        {Object.values(StakeAction).map((action) => (
          <LinkButton
            to={`/stake/${destination}`}
            state={action}
            color={action === StakeAction.DELEGATE ? "primary" : "default"}
            disabled={!availableActions[action]}
            key={action}
          >
            {label[action]}
          </LinkButton>
        ))}
      </ExtraActions>
    )
  }

  const rewardsValues = useMemo(() => {
    const defaultValues = { address: destination, sum: "0", list: [] }
    if (!rewards) return defaultValues
    const { byValidator } = calcRewardsValues(rewards, currency, calcValue)
    const values = byValidator.find(({ address }) => address === destination)
    return values ?? defaultValues
  }, [calcValue, currency, destination, rewards])

  const renderRewardsValue = () => {
    const { sum, list } = rewardsValues
    const amount = list.find(({ denom }) => denom === "uluna")?.amount ?? "0"

    return (
      <section>
        <Read amount={amount} denom="uluna" className={styles.total} />{" "}
        <span className={styles.small}>
          {list.length > 1 &&
            `+${t("{{length}} coins", { length: list.length - 1 })}`}
        </span>
        <Read
          amount={sum}
          denom={currency}
          className="muted"
          integer
          approx
          block
        />
      </section>
    )
  }

  const renderRewardsActions = () => {
    const disabled = !has(rewardsValues.sum)

    return (
      <ExtraActions align="stretch">
        <LinkButton to="/rewards" disabled={disabled} block>
          {t("Withdraw rewards")}
        </LinkButton>
      </ExtraActions>
    )
  }

  return (
    <Col>
      <Card {...delegationState} title={t("My delegations")}>
        <Grid gap={20}>
          {renderDelegationsValue()}
          {renderDelegationsActions()}
        </Grid>
      </Card>

      <Card {...rewardsState} title={t("My rewards")}>
        <Grid gap={20}>
          {renderRewardsValue()}
          {renderRewardsActions()}
        </Grid>
      </Card>
    </Col>
  )
}

export default ValidatorActions
