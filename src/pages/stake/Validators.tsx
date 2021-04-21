import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import VerifiedIcon from "@mui/icons-material/Verified"
import { readPercent } from "@terra.kitchen/utils"
import { Validator } from "@terra-money/terra.js"
/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { useNetworkName } from "data/wallet"
import { combineState } from "data/query"
import { useValidators } from "data/queries/staking"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { useCalcVotingPower } from "data/queries/tendermint"
import { Page, Card, Table, Flex, Grid } from "components/layout"
import ProfileIcon from "./components/ProfileIcon"
import styles from "./Validators.module.scss"

const Validators = () => {
  const { t } = useTranslation()
  const networkName = useNetworkName()

  const calcVotingPower = useCalcVotingPower()
  const { data: validators, ...validatorsState } = useValidators()
  const { data: delegations, ...delegationsState } = useDelegations()
  const { data: undelegations, ...undelegationsState } = useUnbondings()

  const state = combineState(
    validatorsState,
    delegationsState,
    undelegationsState
  )

  const activeValidatorsWithVotingPower = useMemo(() => {
    if (!validators) return null

    return validators
      .filter(({ status }) => !getIsUnbonded(status))
      .map((validator) => {
        const voting_power = calcVotingPower(validator) ?? 0
        return { validator, voting_power }
      })
      .sort(({ voting_power: a }, { voting_power: b }) => b - a)
  }, [calcVotingPower, validators])

  const renderCount = () => {
    if (!activeValidatorsWithVotingPower) return null
    const count = activeValidatorsWithVotingPower.length

    return t("{{count}} validators are active", {
      count,
      network: networkName,
    })
  }

  const render = () => {
    if (!activeValidatorsWithVotingPower) return null
    return (
      <Table
        columns={[
          {
            title: t("Moniker"),
            dataIndex: ["validator", "description", "moniker"],
            defaultSortOrder: "asc",
            sorter: (
              { validator: { description: a } },
              { validator: { description: b } }
            ) => a.moniker.localeCompare(b.moniker),
            render: (moniker, { validator }) => {
              const { operator_address, description } = validator

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
                  <ProfileIcon validator={validator} size={22} />

                  <Grid gap={2}>
                    <Flex gap={4} start>
                      <Link
                        to={`/validator/${operator_address}`}
                        className={styles.moniker}
                      >
                        {moniker}
                      </Link>

                      {description.security_contact && (
                        <VerifiedIcon
                          className="info"
                          style={{ fontSize: 12 }}
                        />
                      )}
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
            dataIndex: ["voting_power"],
            defaultSortOrder: "desc",
            sorter: ({ voting_power: a }, { voting_power: b }) => a - b,
            render: (value) => readPercent(value),
            align: "center",
          },
          {
            title: t("Validator commission"),
            dataIndex: ["validator", "commission", "commission_rates"],
            defaultSortOrder: "asc",
            sorter: (
              { validator: { commission: a } },
              { validator: { commission: b } }
            ) =>
              a.commission_rates.rate.minus(b.commission_rates.rate).toNumber(),
            render: ({ rate }: Validator.CommissionRates) =>
              readPercent(rate.toString(), { fixed: 1 }),
            align: "right",
          },
        ]}
        dataSource={activeValidatorsWithVotingPower}
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
