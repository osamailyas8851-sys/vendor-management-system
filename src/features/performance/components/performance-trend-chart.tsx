import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { PerformanceTrendPoint } from "@/features/performance/types"

const chartConfig = {
  qualityScore: {
    label: "Quality score",
    color: "var(--chart-1)",
  },
  deliveryScore: {
    label: "Delivery score",
    color: "var(--chart-2)",
  },
  riskScore: {
    label: "Risk score",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function PerformanceTrendChart({
  data,
}: {
  data: PerformanceTrendPoint[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
        <CardDescription>
          Quality, delivery and calculated risk over the last six months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          aria-label="Line chart showing vendor quality, delivery and risk scores"
          className="h-[320px] w-full"
          config={chartConfig}
          role="img"
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: -12, right: 12, top: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              domain={[0, 100]}
              tickLine={false}
              width={42}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={false}
            />
            <Line
              dataKey="qualityScore"
              dot={false}
              stroke="var(--color-qualityScore)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="deliveryScore"
              dot={false}
              stroke="var(--color-deliveryScore)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="riskScore"
              dot={false}
              stroke="var(--color-riskScore)"
              strokeDasharray="5 4"
              strokeWidth={2}
              type="monotone"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
        <p className="mt-2 text-xs text-muted-foreground">
          Quality and delivery: higher is better. Risk: lower is better.
        </p>
      </CardContent>
    </Card>
  )
}
