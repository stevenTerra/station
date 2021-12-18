import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"
import { head, last } from "ramda"
import { capitalize } from "@mui/material"
import { isDenomTerraNative, readAmount, readDenom } from "@terra.kitchen/utils"
import { sortDenoms } from "utils/coin"
import { useCurrency } from "data/settings/Currency"
import { Aggregate, useTxVolume } from "data/Terra/TerraKitchen"
import { useActiveDenoms } from "data/queries/oracle"
import { Select } from "components/form"
import { Card } from "components/layout"
import { TooltipIcon } from "components/display"
import ChartContainer from "./components/ChartContainer"
import Filter from "./components/Filter"
import Range from "./components/Range"

const TxVolume = () => {
  const { t } = useTranslation()
  const currency = useCurrency()

  /* data */
  const [denom, setDenom] = useState("uusd")
  const [type, setType] = useState<Aggregate>(Aggregate.PERIODIC)
  const { data: activeDenoms } = useActiveDenoms()
  const { data, ...state } = useTxVolume(denom, type)

  /* render */
  const renderFilter = () => {
    if (!activeDenoms) return null
    return (
      <Filter>
        <Select value={denom} onChange={(e) => setDenom(e.target.value)} small>
          {sortDenoms(activeDenoms, currency)
            .filter(isDenomTerraNative)
            .map((denom) => (
              <option value={denom} key={denom}>
                {readDenom(denom)}
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

  const calcValue = useCallback(
    (range: number) => {
      if (!data) return

      const sliced = data.slice(range).map(({ value }) => value)
      const h = head(sliced)
      const l = last(sliced)
      const t = sliced[sliced.length - 2]

      if (!(h && l && t)) return

      if (range === 3)
        return {
          [Aggregate.CUMULATIVE]: new BigNumber(l).minus(t).toString(),
          [Aggregate.PERIODIC]: l,
        }[type]

      return {
        [Aggregate.CUMULATIVE]: new BigNumber(l).minus(h).toString(),
        [Aggregate.PERIODIC]: BigNumber.sum(...sliced.slice(1)).toString(),
      }[type]
    },
    [data, type]
  )

  const render = () => {
    return (
      <Range initial={3} includeLastDay>
        {(range) => {
          return (
            <ChartContainer
              type={!range || type === Aggregate.CUMULATIVE ? "area" : "bar"}
              result={data}
              range={range}
              total={calcValue(range)}
              unit={readDenom(denom)}
              formatValue={(value) => readAmount(value, { prefix: true })}
              formatY={(value) =>
                readAmount(value, { prefix: true, integer: true })
              }
            />
          )
        }}
      </Range>
    )
  }

  return (
    <Card
      {...state}
      title={
        <TooltipIcon
          content={t(
            "The onchain transaction volume for the selected currency over the selected time period"
          )}
        >
          {t("Tx volume")}
        </TooltipIcon>
      }
      extra={renderFilter()}
      size="small"
    >
      {render()}
    </Card>
  )
}

export default TxVolume
