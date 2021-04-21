import { ReactNode } from "react"
import { ResponsiveContainer } from "recharts"
import { AreaChart, Area, BarChart, Bar } from "recharts"
import { XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { format } from "date-fns"
import ChartTooltip from "./ChartTooltip"

const getVariable = (key: string) =>
  getComputedStyle(document.body).getPropertyValue(key)

export const CHART_HEIGHT = 240
const ANIMATION_DURATION = 100
const FONT_SIZE = 11

export interface ChartPoint {
  t: Date
  v: number
  y: ReactNode
}

export interface ChartProps {
  type: "bar" | "area"
  formatValue: (value: string) => ReactNode
  formatY: (value: string) => string
}

interface Props extends ChartProps {
  data: ChartPoint[]
}

const Chart = ({ type = "area", formatY, data }: Props) => {
  const COLORS = {
    // Call this fn inside the component to get the latest theme
    STROKE: getVariable("--chart"),
    DEFAULT: getVariable("--button-default-bg"),
    MUTED: getVariable("--text-muted"),
    BORDER: getVariable("--card-border"),
  }

  /* by chart type */
  const renderChart = {
    bar: (children: ReactNode) => (
      <BarChart data={data}>
        {children}
        <Bar
          dataKey="v"
          fill={COLORS.STROKE}
          animationDuration={ANIMATION_DURATION}
        />
      </BarChart>
    ),
    area: (children: ReactNode) => (
      <AreaChart data={data}>
        {children}
        <Area
          dataKey="v"
          type="monotone"
          stroke={COLORS.STROKE}
          strokeWidth={2}
          fill={COLORS.STROKE}
          fillOpacity={0.05}
          animationDuration={ANIMATION_DURATION}
        />
      </AreaChart>
    ),
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      {renderChart[type](
        <>
          <XAxis
            dataKey="t"
            fontSize={FONT_SIZE}
            minTickGap={30} // Margin between each text
            tick={{ fill: COLORS.MUTED }} // Text color
            tickFormatter={(t) =>
              format(t, data.length > 30 ? "yyyy QQQ" : "MMM d")
            }
            tickMargin={8} // Padding between text and chart
            tickSize={0} // Line between text and chart
            height={24} // Space including padding
          />
          <YAxis
            dataKey="v"
            axisLine={false} // Show the vertical line
            fontSize={FONT_SIZE}
            orientation="right"
            tick={{ fill: COLORS.MUTED }} // Text color
            tickFormatter={formatY}
            tickMargin={4} // Padding between text and chart
            tickSize={0} // Line between text and chart
            width={32} // Space including padding
          />
          <Tooltip
            cursor={{ fill: COLORS.BORDER, stroke: COLORS.BORDER }}
            content={<ChartTooltip />}
          />
          <CartesianGrid stroke={COLORS.BORDER} vertical={false} />
        </>
      )}
    </ResponsiveContainer>
  )
}

export default Chart
