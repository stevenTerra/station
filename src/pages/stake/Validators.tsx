import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import VerifiedIcon from "@mui/icons-material/Verified"
import { readPercent } from "@terra.kitchen/utils"
import { Validator } from "@terra-money/terra.js"
/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { combineState } from "data/query"
import { useOracleParams } from "data/queries/oracle"
import { useValidators } from "data/queries/staking"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { getCalcUptime, getCalcVotingPowerRate } from "data/Terra/api"
import { calcSelfDelegation, useTerraValidators } from "data/Terra/api"
import { Page, Card, Table, Flex, Grid } from "components/layout"
import { Tooltip } from "components/display"
import ProfileIcon from "./components/ProfileIcon"
import { ValidatorJailed } from "./components/ValidatorTag"
import styles from "./Validators.module.scss"

const Validators = () => {
  const { t } = useTranslation()

  const { data: oracleParams, ...oracleParamsState } = useOracleParams()
  const { data: validators, ...validatorsState } = useValidators()
  const { data: delegations, ...delegationsState } = useDelegations()
  const { data: undelegations, ...undelegationsState } = useUnbondings()
  const { data: TerraValidators, ...TerraValidatorsState } =
    useTerraValidators()

  const state = combineState(
    oracleParamsState,
    validatorsState,
    delegationsState,
    undelegationsState,
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
          ...validator,
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

  const renderCount = () => {
    if (!activeValidators) return null
    const count = activeValidators.length
    return t("{{count}} active validators", { count })
  }

  const render = () => {
    if (!activeValidators) return null

    return (
      <Table
        dataSource={activeValidators}
        sorter={(a, b) =>
          Number(a.jailed) - Number(b.jailed) ||
          Number(!!b.voting_power_rate) - Number(!!a.voting_power_rate)
        }
        rowKey={({ operator_address }) => operator_address}
        columns={[
          {
            title: t("Moniker"),
            dataIndex: ["description", "moniker"],
            defaultSortOrder: "asc",
            sorter: ({ description: a }, { description: b }) =>
              a.moniker.localeCompare(b.moniker),
            render: (moniker, validator) => {
              const { operator_address, jailed } = validator
              const { contact } = validator

              const delegated = delegations?.find(
                ({ validator_address }) =>
                  validator_address === operator_address
              )

              const undelegated = undelegations?.find(
                ({ validator_address }) =>
                  validator_address === operator_address
              )

              return (
                <Flex start gap={8}>
                  <ProfileIcon src={validator.picture} size={22} />

                  <Grid gap={2}>
                    <Flex gap={4} start>
                      <Link
                        to={`/validator/${operator_address}`}
                        className={styles.moniker}
                      >
                        {moniker}
                      </Link>

                      {contact?.email && (
                        <VerifiedIcon
                          className="info"
                          style={{ fontSize: 12 }}
                        />
                      )}

                      {jailed && <ValidatorJailed />}
                    </Flex>

                    {(delegated || undelegated) && (
                      <p className={styles.muted}>
                        {[
                          delegated && t("Delegated"),
                          undelegated && t("Undelegated"),
                        ]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    )}
                  </Grid>
                </Flex>
              )
            },
          },
          {
            title: t("Voting power"),
            dataIndex: "voting_power_rate",
            defaultSortOrder: "desc",
            sorter: (
              { voting_power_rate: a = 0 },
              { voting_power_rate: b = 0 }
            ) => a - b,
            render: (value) => !!value && readPercent(value),
            align: "right",
          },
          {
            title: t("Self-delegation"),
            dataIndex: "selfDelegation",
            defaultSortOrder: "desc",
            sorter: ({ selfDelegation: a = 0 }, { selfDelegation: b = 0 }) =>
              a - b,
            render: (value) => !!value && readPercent(value),
            align: "right",
          },
          {
            title: t("Commission"),
            dataIndex: ["commission", "commission_rates"],
            defaultSortOrder: "asc",
            sorter: (
              { commission: { commission_rates: a } },
              { commission: { commission_rates: b } }
            ) => a.rate.toNumber() - b.rate.toNumber(),
            render: ({ rate }: Validator.CommissionRates) =>
              readPercent(rate.toString(), { fixed: 1 }),
            align: "right",
          },
          {
            title: t("Uptime"),
            dataIndex: "uptime",
            defaultSortOrder: "desc",
            sorter: ({ uptime: a = 0 }, { uptime: b = 0 }) => a - b,
            render: (value) =>
              !!value && (
                <Tooltip content={readPercent(value, { fixed: 4 })}>
                  <span>{readPercent(value, { fixed: 0 })}</span>
                </Tooltip>
              ),
            align: "right",
          },
        ]}
      />
    )
  }

  return (
    <Page title={t("Validators")} extra={renderCount()} sub>
      <Card {...state}>{render()}</Card>
    </Page>
  )
}

export default Validators

/* helpers */
const getIsUnbonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_UNBONDED
