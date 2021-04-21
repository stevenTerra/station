import { useTranslation } from "react-i18next"
import { flatten } from "ramda"
import { AccAddress, Dec, UnbondingDelegation } from "@terra-money/terra.js"
import { getMaxHeightStyle } from "utils/style"
import { useCurrency } from "data/settings/Currency"
import { combineState } from "data/query"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { calcUnbondingsTotal, useUnbondings } from "data/queries/staking"
import { useValidators } from "data/queries/staking"
import { ValidatorLink } from "components/general"
import { ModalButton } from "components/feedback"
import { Table } from "components/layout"
import { Read } from "components/token"
import { ToNow } from "components/display"
import StakedCard from "./components/StakedCard"

const Unbondings = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const calcValue = useMemoizedCalcValue(currency)

  const { data: validators, ...validatorsResult } = useValidators()
  const { data: unbondings, ...unbondingsResult } = useUnbondings()
  const state = combineState(validatorsResult, unbondingsResult)

  /* render */
  const title = t("Unbondings")

  const render = () => {
    if (!unbondings) return null

    const total = calcUnbondingsTotal(unbondings)
    const value = calcValue({ amount: total, denom: "uluna" })

    return (
      <ModalButton
        title={title}
        renderButton={(open) => (
          <StakedCard
            {...state}
            title={title}
            amount={total}
            value={value}
            onClick={open}
          />
        )}
      >
        <Table
          style={getMaxHeightStyle(320)}
          columns={[
            {
              title: t("Validator"),
              dataIndex: "validator_address",
              render: (address: AccAddress) => (
                <ValidatorLink address={address} />
              ),
            },
            {
              title: t("Amount"),
              dataIndex: "initial_balance",
              render: (amount: Dec) => (
                <Read amount={amount.toString()} denom="uluna" />
              ),
              align: "right",
            },
            {
              title: t("Release on"),
              dataIndex: "completion_time",
              render: (date: Date) => <ToNow>{date}</ToNow>,
              align: "right",
            },
          ]}
          dataSource={flattenUnbondings(unbondings)}
        />
      </ModalButton>
    )
  }

  return render()
}

export default Unbondings

/* helpers */
const flattenUnbondings = (unbondings: UnbondingDelegation[]) => {
  return flatten(
    unbondings.map(({ validator_address, entries }) => {
      return entries.map((entry) => ({ ...entry, validator_address }))
    })
  )
}
