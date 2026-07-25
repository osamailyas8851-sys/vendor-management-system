import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  MinusIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardKpi } from "@/features/dashboard/types"

type SectionCardsProps = {
  items: DashboardKpi[]
}

const trendIcon = {
  down: ArrowDownRightIcon,
  neutral: MinusIcon,
  up: ArrowUpRightIcon,
}

export function SectionCards({ items }: SectionCardsProps) {
  return (
    <section
      aria-label="Vendor key performance indicators"
      className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-3"
    >
      {items.map((item) => {
        const TrendIcon = trendIcon[item.trend]

        return (
          <Card
            className="bg-linear-to-br from-card to-primary/[0.035] shadow-xs"
            key={item.id}
          >
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {item.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon data-icon="inline-start" />
                  {item.change}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="border-t-0 bg-transparent pt-0 text-sm text-muted-foreground">
              {item.description}
            </CardFooter>
          </Card>
        )
      })}
    </section>
  )
}
