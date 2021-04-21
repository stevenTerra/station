import { useTranslation } from "react-i18next"
import DownloadIcon from "@mui/icons-material/Download"
import { has } from "utils/num"
import { useCurrency } from "data/settings/Currency"
import { combineState } from "data/query"
import { calcRewardsValues, useRewards } from "data/queries/distribution"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { calcDelegationsTotal } from "data/queries/staking"
import { calcUnbondingsTotal } from "data/queries/staking"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { LinkButton } from "components/general"
import { Card, Grid } from "components/layout"
import { Read } from "components/token"
import DelegationsPromote from "app/containers/DelegationsPromote"
import styles from "./Rewards.module.scss"

const Rewards = () => {
  const { t } = useTranslation()

  const currency = useCurrency()
  const calcValue = useMemoizedCalcValue()

  const { data: rewards, ...rewardsResult } = useRewards()
  const { data: delegations, ...delegationsResult } = useDelegations()
  const { data: unbondings, ...unbondingsResult } = useUnbondings()
  const state = combineState(rewardsResult, delegationsResult, unbondingsResult)

  const render = () => {
    if (!(rewards && delegations && unbondings)) return null

    const rewardsValues = calcRewardsValues(rewards, currency, calcValue)
    const delegationTotal = calcDelegationsTotal(delegations)
    const unbondingsTotal = calcUnbondingsTotal(unbondings)

    return !delegations.length ? (
      <DelegationsPromote />
    ) : (
      <Card {...state} title={t("Staking rewards")}>
        <Grid gap={28}>
          <article>
            <Read
              className={styles.total}
              amount={rewardsValues?.total.sum}
              token={currency}
              auto
              approx
            />
          </article>

          {has(delegationTotal) && (
            <article>
              <h1>{t("Delegations")}</h1>
              <Read
                className={styles.number}
                amount={delegationTotal}
                denom="uluna"
              />
            </article>
          )}

          {has(unbondingsTotal) && (
            <article>
              <h1>{t("Undelegations")}</h1>
              <Read
                className={styles.number}
                amount={unbondingsTotal}
                denom="uluna"
              />
            </article>
          )}

          <LinkButton
            icon={<DownloadIcon style={{ fontSize: 18 }} />}
            to="/rewards"
            block
          >
            {t("Withdraw rewards")}
          </LinkButton>
        </Grid>
      </Card>
    )
  }

  return render()
}

export default Rewards
