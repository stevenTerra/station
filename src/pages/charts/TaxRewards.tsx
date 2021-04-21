import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"
import { head, last } from "ramda"
import capitalize from "@mui/utils/capitalize"
import { readAmount, readDenom } from "@terra.kitchen/utils"
import { Aggregate, useTaxRewards } from "data/Terra/TerraKitchen"
import { useCurrency } from "data/settings/Currency"
import { Select } from "components/form"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import ChartContainer from "./components/ChartContainer"
import Range from "./components/Range"
import Filter from "./components/Filter"

const TaxRewards = () => {
  const { t } = useTranslation()
  const currency = useCurrency()

  /* data */
  const [type, setType] = useState<Aggregate>(Aggregate.CUMULATIVE)
  const { data, ...state } = useTaxRewards(type)

  /* render */
  const renderFilter = () => {
    return (
      <Filter>
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

  const calcValue = useCallback(
    (range: number) => {
      if (!data) return

      const sliced = data.slice(range).map(({ value }) => value)
      const h = head(sliced)
      const l = last(sliced)

      if (!(h && l)) return

      return {
        [Aggregate.CUMULATIVE]: new BigNumber(l).minus(h).toString(),
        [Aggregate.PERIODIC]: BigNumber.sum(...sliced.slice(1)).toString(),
      }[type]
    },
    [data, type]
  )

  const render = () => {
    return (
      <Range>
        {(range) => (
          <ChartContainer
            type={!range || type === Aggregate.CUMULATIVE ? "area" : "bar"}
            result={data}
            total={calcValue(range)}
            unit={readDenom(currency)}
            range={range}
            formatValue={(value) => readAmount(value, { prefix: true })}
            formatY={(value) =>
              readAmount(value, { prefix: true, integer: true })
            }
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
          content={t("Tax rewards distributed over the selected time period")}
        >
          {t("Tax rewards")}
        </TooltipIcon>
      }
      extra={renderFilter()}
      size="small"
    >
      {render()}
    </Card>
  )
}

export default TaxRewards
