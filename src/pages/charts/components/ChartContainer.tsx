import { useTranslation } from "react-i18next"
import classNames from "classnames"
import ERROR from "config/ERROR"
import { useThemeAnimation } from "data/settings/Theme"
import { Flex } from "components/layout"
import { Wrong } from "components/feedback"
import Chart, { ChartProps, CHART_HEIGHT } from "./Chart"
import styles from "./ChartContainer.module.scss"

const LOADING = {
  width: CHART_HEIGHT / 2,
  height: CHART_HEIGHT / 2,
  style: { margin: CHART_HEIGHT / 4 },
}

interface Props extends ChartProps {
  /* response */
  result?: ChartDataItem[]

  /* filter */
  range: number

  /* total */
  total?: Amount
  unit?: string
}

const ChartContainer = (props: Props) => {
  const { result, range, total, unit, formatValue } = props
  const { t } = useTranslation()
  const animation = useThemeAnimation()

  const renderTotal = () => {
    if (!total)
      return (
        <h1 className={classNames(styles.title, "muted")}>{t("Loading...")}</h1>
      )

    return (
      <h1 className={styles.title}>
        {formatValue(total)} <small>{unit}</small>
      </h1>
    )
  }

  const render = () => {
    if (!result) return <img src={animation} alt="" {...LOADING} />
    if (result.length < 3) return <Wrong>{ERROR.CHART.LACK_OF_DATA}</Wrong>
    const data = result.slice(range).map(convert(formatValue))
    return <Chart {...props} data={data} />
  }

  return (
    <article className={styles.grid}>
      {renderTotal()}
      <Flex>{render()}</Flex>
    </article>
  )
}

export default ChartContainer

/* utils */
const convert = (formatValue: ChartProps["formatValue"]) => {
  return ({ datetime, value }: ChartDataItem) => {
    return {
      t: new Date(datetime),
      v: Number(value),
      y: formatValue(value),
    }
  }
}
