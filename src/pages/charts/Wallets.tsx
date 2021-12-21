import { useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "ramda"
import capitalize from "@mui/utils/capitalize"
import { formatNumber } from "@terra.kitchen/utils"
import { Aggregate, AggregateWallets } from "data/Terra/api"
import { useWallets } from "data/Terra/api"
import { combineState } from "data/query"
import { Select } from "components/form"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import ChartContainer from "./components/ChartContainer"
import Range from "./components/Range"
import Filter from "./components/Filter"

const Wallets = () => {
  const { t } = useTranslation()
  const [walletsType, setWalletsType] = useState<AggregateWallets>(
    AggregateWallets.TOTAL
  )

  /* data */
  const [type, setType] = useState<Aggregate>(Aggregate.CUMULATIVE)
  const { data, ...result } = useWallets(walletsType, type)
  const totalResult = useWallets(AggregateWallets.TOTAL, type) // for value
  const { data: total, ...totalState } = totalResult
  const state = combineState(result, totalState)

  /* render */
  const renderFilter = () => {
    return (
      <Filter>
        <Select
          value={walletsType}
          onChange={(e) => setWalletsType(e.target.value as AggregateWallets)}
          small
        >
          {Object.values(AggregateWallets).map((type) => (
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
            unit={t("wallets")}
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
            "Number of total registered wallets in the selected period"
          )}
        >
          {t("Wallets")}
        </TooltipIcon>
      }
      extra={renderFilter()}
      size="small"
    >
      {render()}
    </Card>
  )
}

export default Wallets
