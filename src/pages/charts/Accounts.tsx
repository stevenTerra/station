import { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "ramda"
import capitalize from "@mui/utils/capitalize"
import { formatNumber } from "@terra.kitchen/utils"
import { Aggregate, AggregateAccounts } from "data/Terra/TerraKitchen"
import { useAccounts } from "data/Terra/TerraKitchen"
import { combineState } from "data/query"
import { Select } from "components/form"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import ChartContainer from "./components/ChartContainer"
import Range from "./components/Range"
import Filter from "./components/Filter"

const Accounts = () => {
  const { t } = useTranslation()
  const [accountsType, setAccountsType] = useState<AggregateAccounts>(
    AggregateAccounts.TOTAL
  )

  /* data */
  const [type, setType] = useState<Aggregate>(Aggregate.CUMULATIVE)
  const { data, ...result } = useAccounts(accountsType, type)
  const totalResult = useAccounts(AggregateAccounts.TOTAL, type) // for value
  const { data: total } = totalResult
  const state = combineState(result, totalResult)

  /* render */
  const renderFilter = () => {
    return (
      <Filter>
        <Select
          value={accountsType}
          onChange={(e) => setAccountsType(e.target.value as AggregateAccounts)}
          small
        >
          {Object.values(AggregateAccounts).map((type) => (
            <option value={type} key={type}>
              {capitalize(type)}
            </option>
          ))}
        </Select>

        <Select
          value={type}
          onChange={(e) => setType(e.target.value as Aggregate)}
          small
        >
          {Object.values(Aggregate).map((type) => (
            <option value={type} key={type}>
              {capitalize(type)}
            </option>
          ))}
        </Select>
      </Filter>
    )
  }

  const render = () => {
    return (
      <Range>
        {(range) => (
          <ChartContainer
            type={!range || type === Aggregate.CUMULATIVE ? "area" : "bar"}
            result={data}
            range={range}
            total={total && last(total)?.value}
            unit={t("accounts")}
            formatValue={(value) => formatNumber(value, { prefix: true })}
            formatY={(value) => formatNumber(value, { prefix: true, fixed: 1 })}
          />
        )}
      </Range>
    )
  }

  return (
    <Card
      {...state}
      title={
        <TooltipIcon
          content={t(
            "Number of total registered accounts in the selected period"
          )}
        >
          {t("Accounts")}
        </TooltipIcon>
      }
      extra={renderFilter()}
      size="small"
    >
      {render()}
    </Card>
  )
}

export default Accounts
