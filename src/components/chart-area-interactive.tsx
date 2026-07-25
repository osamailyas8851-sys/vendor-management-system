import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardAction,
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import type { VendorPerformancePoint } from "@/features/dashboard/types"

const chartConfig = {
  qualityScore: {
    label: "Quality score",
    color: "var(--chart-1)",
  },
  deliveryScore: {
    label: "Delivery score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type ChartAreaInteractiveProps = {
  data: VendorPerformancePoint[]
}

export function ChartAreaInteractive({
  data,
}: ChartAreaInteractiveProps) {
  const [range, setRange] = React.useState("6m")
  const visibleData = range === "3m" ? data.slice(-3) : data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor performance trend</CardTitle>
        <CardDescription>
          Average quality and delivery scores across active vendors
        </CardDescription>
        <CardAction>
          <ToggleGroup
            aria-label="Select performance period"
            multiple={false}
            onValueChange={(value) => setRange(value[0] ?? "6m")}
            size="sm"
            value={[range]}
            variant="outline"
          >
            <ToggleGroupItem value="6m">6 months</ToggleGroupItem>
            <ToggleGroupItem value="3m">3 months</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          aria-label="Area chart showing vendor quality and delivery scores"
          className="h-[280px] w-full"
          config={chartConfig}
          role="img"
        >
          <AreaChart
            accessibilityLayer
            data={visibleData}
            margin={{ left: -14, right: 8, top: 8 }}
          >
            <defs>
              <linearGradient id="fill-quality" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-qualityScore)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-qualityScore)"
                  stopOpacity={0.04}
                />
              </linearGradient>
              <linearGradient id="fill-delivery" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-deliveryScore)"
                  stopOpacity={0.32}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-deliveryScore)"
                  stopOpacity={0.03}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              domain={[60, 100]}
              tickCount={5}
              tickLine={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
              cursor={false}
            />
            <Area
              dataKey="deliveryScore"
              fill="url(#fill-delivery)"
              stroke="var(--color-deliveryScore)"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="qualityScore"
              fill="url(#fill-quality)"
              stroke="var(--color-qualityScore)"
              strokeWidth={2}
              type="monotone"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
