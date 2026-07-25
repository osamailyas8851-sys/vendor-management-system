import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { MonthlyPurchaseValuePoint } from "@/features/dashboard/types"

const chartConfig = {
  value: {
    label: "Purchase value (₹ Cr)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type MonthlyPurchaseValueChartProps = {
  data: MonthlyPurchaseValuePoint[]
}

export function MonthlyPurchaseValueChart({
  data,
}: MonthlyPurchaseValueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Purchase Value</CardTitle>
        <CardDescription>
          Purchase value recorded each month, in ₹ crore
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          aria-label="Bar chart showing monthly purchase value in crore rupees"
          className="h-[260px] w-full"
          config={chartConfig}
          role="img"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: -2, right: 8, top: 8 }}
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
              domain={[0, "auto"]}
              tickFormatter={(value) => `₹${value} Cr`}
              tickLine={false}
              width={62}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={false}
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
