import { Cell, Pie, PieChart } from "recharts"

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
import type { VendorCategoryDistribution } from "@/features/dashboard/types"

type CategoryDistributionChartProps = {
  data: VendorCategoryDistribution[]
}

export function CategoryDistributionChart({
  data,
}: CategoryDistributionChartProps) {
  const chartConfig = data.reduce<ChartConfig>((config, item, index) => {
    config[item.id] = {
      label: item.category,
      color: "var(--chart-" + ((index % 5) + 1) + ")",
    }
    return config
  }, {})

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category distribution</CardTitle>
        <CardDescription>
          Approved vendors grouped by primary category
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <ChartContainer
          aria-label="Donut chart showing vendors by category"
          className="mx-auto h-[220px] w-full max-w-[280px]"
          config={chartConfig}
          role="img"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="category"
                />
              }
              cursor={false}
            />
            <Pie
              data={data}
              dataKey="value"
              innerRadius={58}
              nameKey="category"
              outerRadius={88}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((item) => (
                <Cell
                  fill={"var(--color-" + item.id + ")"}
                  key={item.id}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="grid min-w-44 gap-3">
          {data.map((item, index) => (
            <div className="flex items-center justify-between gap-5" key={item.id}>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-sm"
                  style={{
                    background: "var(--chart-" + ((index % 5) + 1) + ")",
                  }}
                />
                {item.category}
              </span>
              <span className="font-medium tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
