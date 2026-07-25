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
import type { VendorRatingDistributionPoint } from "@/features/dashboard/types"

const chartConfig = {
  vendors: {
    label: "Vendors",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type VendorRatingDistributionChartProps = {
  data: VendorRatingDistributionPoint[]
}

export function VendorRatingDistributionChart({
  data,
}: VendorRatingDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Rating Distribution</CardTitle>
        <CardDescription>
          Number of vendors grouped by their current rating
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          aria-label="Horizontal bar chart showing vendor rating distribution"
          className="h-[260px] w-full"
          config={chartConfig}
          role="img"
        >
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 4, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              axisLine={false}
              allowDecimals={false}
              tickLine={false}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="rating"
              tickLine={false}
              tickMargin={8}
              type="category"
              width={54}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={false}
            />
            <Bar
              dataKey="vendors"
              fill="var(--color-vendors)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
