import { createFileRoute } from "@tanstack/react-router"

import { CategoryDistributionChart } from "@/components/category-distribution-chart"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { MonthlyPurchaseValueChart } from "@/components/monthly-purchase-value-chart"
import { SectionCards } from "@/components/section-cards"
import { VendorRatingDistributionChart } from "@/components/vendor-rating-distribution-chart"
import {
  DashboardEmpty,
  DashboardError,
  DashboardLoading,
} from "@/features/dashboard/components/dashboard-states"
import { useDashboardQuery } from "@/features/dashboard/api/dashboard.queries"

export const Route = createFileRoute("/")({
  component: DashboardRoute,
})

function DashboardRoute() {
  const dashboardQuery = useDashboardQuery()

  if (dashboardQuery.isPending) {
    return (
      <main className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-6">
        <DashboardPageHeading />
        <DashboardLoading />
      </main>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <main className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-6">
        <DashboardPageHeading />
        <DashboardError
          message={dashboardQuery.error.message}
          onRetry={() => void dashboardQuery.refetch()}
        />
      </main>
    )
  }

  const dashboard = dashboardQuery.data
  const isEmpty =
    dashboard.kpis.length === 0 &&
    dashboard.performance.length === 0 &&
    dashboard.categoryDistribution.length === 0 &&
    dashboard.monthlyPurchaseValue.length === 0 &&
    dashboard.vendorRatingDistribution.length === 0

  return (
    <main className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-6">
      <DashboardPageHeading updatedAt={dashboard.updatedAt} />

      {isEmpty ? (
        <DashboardEmpty onRefresh={() => void dashboardQuery.refetch()} />
      ) : (
        <>
          <SectionCards items={dashboard.kpis} />
          <section
            aria-label="Vendor analytics"
            className="grid gap-4 px-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] lg:px-6"
          >
            <ChartAreaInteractive data={dashboard.performance} />
            <CategoryDistributionChart
              data={dashboard.categoryDistribution}
            />
          </section>
          <section
            aria-label="Purchase and rating analytics"
            className="grid gap-4 px-4 md:grid-cols-2 lg:px-6"
          >
            <MonthlyPurchaseValueChart
              data={dashboard.monthlyPurchaseValue}
            />
            <VendorRatingDistributionChart
              data={dashboard.vendorRatingDistribution}
            />
          </section>
          <DataTable data={dashboard.recentVendors} />
        </>
      )}
    </main>
  )
}

type DashboardPageHeadingProps = {
  updatedAt?: string
}

function DashboardPageHeading({ updatedAt }: DashboardPageHeadingProps) {
  return (
    <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-end sm:justify-between lg:px-6">
      <div>
        <p className="text-sm text-muted-foreground">Procurement overview</p>
        <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight">
          Good morning, Ananya
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Monitor vendor health, approvals and purchase activity from one place.
        </p>
      </div>
      {updatedAt ? (
        <span className="w-fit rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Updated{" "}
          {new Intl.DateTimeFormat("en-IN", {
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(updatedAt))}
        </span>
      ) : null}
    </div>
  )
}
