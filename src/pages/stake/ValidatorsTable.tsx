import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import VerifiedIcon from "@mui/icons-material/Verified"
import { readPercent } from "@terra.kitchen/utils"
/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { TerraValidator } from "types/validator"
import { combineState } from "data/query"
import { useOracleParams } from "data/queries/oracle"
import { useValidators } from "data/queries/staking"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { getCalcUptime, getCalcVotingPowerRate } from "data/Terra/TerraAPI"
import { calcSelfDelegation, useTerraValidators } from "data/Terra/TerraAPI"
import { Page, Card, Flex, Grid } from "components/layout"
import Table from "./components/Table"
import { Tooltip } from "components/display"
import ProfileIcon from "./components/ProfileIcon"
import { ValidatorJailed } from "./components/ValidatorTag"
import styles from "./Validators.module.scss"

const Validators = () => {
  const { t } = useTranslation()

  const { data: oracleParams, ...oracleParamsState } = useOracleParams()
  const { data: validators, ...validatorsState } = useValidators()

  const { data: TerraValidators, ...TerraValidatorsState } =
    useTerraValidators()

  const state = combineState(
    oracleParamsState,
    validatorsState,
    TerraValidatorsState
  )

  const activeValidators = useMemo(() => {
    if (!(oracleParams && validators && TerraValidators)) return null

    const calcRate = getCalcVotingPowerRate(TerraValidators)
    const calcUptime = getCalcUptime(oracleParams)

    return validators
      .filter(({ status }) => !getIsUnbonded(status))
      .map((validator) => {
        const { operator_address } = validator

        const TerraValidator = TerraValidators.find(
          (validator) => validator.operator_address === operator_address
        )

        const voting_power_rate = calcRate(operator_address)
        const selfDelegation = calcSelfDelegation(TerraValidator)
        const uptime = calcUptime(TerraValidator)

        return {
          ...TerraValidator,
          ...validator.toData(),
          voting_power_rate,
          selfDelegation,
          uptime,
        }
      })
      .sort(
        (a, b) =>
          Number(b.uptime) - Number(a.uptime) ||
          Number(b.selfDelegation) - Number(a.selfDelegation) ||
          Number(b.voting_power_rate) - Number(a.voting_power_rate)
      )
  }, [TerraValidators, oracleParams, validators])

  const columns = useMemo(() => {
    return [
      {
        Header: t<string>("Moniker"),
        accessor: (validator: ExtendedValidator) => <Moniker {...validator} />,
      },
      {
        Header: t<string>("Voting power"),
        accessor: ({ voting_power_rate }: ExtendedValidator) =>
          !!voting_power_rate && readPercent(voting_power_rate),
      },
      {
        Header: t<string>("Self-delegation"),
        accessor: ({ selfDelegation }: ExtendedValidator) =>
          !!selfDelegation && readPercent(selfDelegation),
      },
      {
        Header: t<string>("Commission"),
        accessor: ({
          commission: {
            commission_rates: { rate },
          },
        }: ExtendedValidator) => readPercent(rate.toString(), { fixed: 1 }),
      },
      {
        Header: t<string>("Uptime"),
        accessor: ({ uptime }: ExtendedValidator) =>
          !!uptime && (
            <Tooltip content={readPercent(uptime, { fixed: 4 })}>
              <span>{readPercent(uptime, { fixed: 0 })}</span>
            </Tooltip>
          ),
      },
    ]
  }, [t])

  const renderCount = () => {
    if (!validators) return null
    const count = validators.filter(({ status }) => getIsBonded(status)).length
    return t("{{count}} active validators", { count })
  }

  const render = () => {
    if (!activeValidators) return null

    return <Table data={activeValidators} columns={columns} />
  }

  return (
    <Page title={t("Validators")} extra={renderCount()} sub>
      <Card {...state}>{render()}</Card>
    </Page>
  )
}

export default Validators

/* helpers */
const getIsBonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_BONDED

const getIsUnbonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_UNBONDED

/* components */
interface ExtendedValidator extends TerraValidator {
  voting_power_rate?: number
  selfDelegation?: number
  uptime?: number
}

const Moniker = ({
  description: { moniker },
  operator_address,
  jailed,
  picture,
  contact,
}: ExtendedValidator) => {
  const { t } = useTranslation()
  const { data: delegations } = useDelegations()
  const { data: unbondings } = useUnbondings()

  const delegated = delegations?.find(
    ({ validator_address }) => validator_address === operator_address
  )

  const undelegated = unbondings?.find(
    ({ validator_address }) => validator_address === operator_address
  )

  return (
    <Flex start gap={8}>
      <ProfileIcon src={picture} size={22} />

      <Grid gap={2}>
        <Flex gap={4} start>
          <Link
            to={`/validator/${operator_address}`}
            className={styles.moniker}
          >
            {moniker}
          </Link>

          {contact?.email && (
            <VerifiedIcon className="info" style={{ fontSize: 12 }} />
          )}

          {jailed && <ValidatorJailed />}
        </Flex>

        {(delegated || undelegated) && (
          <p className={styles.muted}>
            {[delegated && t("Delegated"), undelegated && t("Undelegated")]
              .filter(Boolean)
              .join(" | ")}
          </p>
        )}
      </Grid>
    </Flex>
  )
}
