import * as React from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  ActivityIcon,
  CircleAlertIcon,
  Clock3Icon,
  ExternalLinkIcon,
  GaugeIcon,
  PackageCheckIcon,
  RefreshCwIcon,
  SearchIcon,
  StarIcon,
  TruckIcon,
} from "lucide-react"
import { z } from "zod"

import { ApiError } from "@/api/client"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  usePerformanceIndexQuery,
  useVendorPerformanceQuery,
} from "@/features/performance/api/performance.queries"
import { PerformancePaymentHistory } from "@/features/performance/components/performance-payment-history"
import { PerformanceRecentIssues } from "@/features/performance/components/performance-recent-issues"
import { PerformanceTrendChart } from "@/features/performance/components/performance-trend-chart"
import { RiskLevelBadge } from "@/features/performance/components/risk-level-badge"
import type {
  PerformanceVendorOption,
  VendorPerformanceMetrics,
} from "@/features/performance/types"
import type { VendorStatus } from "@/features/vendors/types"

const performanceSearchSchema = z.object({
  vendorId: z.string().optional(),
})

export const Route = createFileRoute("/performance")({
  component: PerformanceRoute,
  validateSearch: performanceSearchSchema,
})

const statusVariant: Record<
  VendorStatus,
  "destructive" | "outline" | "secondary"
> = {
  Active: "secondary",
  Blacklisted: "destructive",
  Inactive: "outline",
  Pending: "outline",
}

function MetricCard({
  description,
  icon: Icon,
  progress,
  title,
  value,
}: {
  description: React.ReactNode
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  progress?: number
  title: string
  value: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="grid gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="mt-1 font-heading text-2xl font-medium tabular-nums">
              {value}
            </div>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        </div>
        {typeof progress === "number" ? (
          <div
            aria-label={`${title}: ${progress}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
        <div className="text-xs text-muted-foreground">{description}</div>
      </CardContent>
    </Card>
  )
}

function PerformanceMetrics({ metrics }: { metrics: VendorPerformanceMetrics }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        description="Product and service acceptance score"
        icon={PackageCheckIcon}
        progress={metrics.qualityScore}
        title="Quality Score"
        value={`${metrics.qualityScore}%`}
      />
      <MetricCard
        description="Orders delivered within the agreed schedule"
        icon={TruckIcon}
        progress={metrics.deliveryScore}
        title="Delivery Score"
        value={`${metrics.deliveryScore}%`}
      />
      <MetricCard
        description="Average time to acknowledge requests"
        icon={Clock3Icon}
        title="Response Time"
        value={`${metrics.responseTimeHours}h`}
      />
      <MetricCard
        description={<RiskLevelBadge riskLevel={metrics.riskLevel} />}
        icon={GaugeIcon}
        title="Risk Score"
        value={`${metrics.riskScore}/100`}
      />
      <MetricCard
        description="Overall relationship rating"
        icon={StarIcon}
        title="Vendor Rating"
        value={
          metrics.rating > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <StarIcon className="size-4 fill-current text-amber-500" />
              {metrics.rating.toFixed(1)}
            </span>
          ) : (
            "Unrated"
          )
        }
      />
    </section>
  )
}

function VendorSelector({
  items,
  onSelect,
  selectedVendorId,
}: {
  items: PerformanceVendorOption[]
  onSelect: (vendorId: string) => void
  selectedVendorId?: string
}) {
  const [search, setSearch] = React.useState("")
  const filteredItems = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const matches = normalizedSearch
      ? items.filter((item) =>
          [item.name, item.code, item.category].some((value) =>
            value.toLowerCase().includes(normalizedSearch)
          )
        )
      : items
    const selected = items.find((item) => item.id === selectedVendorId)

    return selected && !matches.some((item) => item.id === selected.id)
      ? [selected, ...matches]
      : matches
  }, [items, search, selectedVendorId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Vendor</CardTitle>
        <CardDescription>
          Choose a vendor to review its complete performance profile
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-[minmax(220px,0.8fr)_minmax(280px,1.2fr)]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search performance vendors"
            className="pl-8"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendor, code or category…"
            value={search}
          />
        </div>
        <Select
          onValueChange={(value) => {
            if (value && value !== "__no-results") onSelect(value)
          }}
          value={selectedVendorId}
        >
          <SelectTrigger aria-label="Select vendor" className="w-full">
            <SelectValue placeholder="Select a vendor" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {filteredItems.length ? (
              filteredItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{item.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.code}
                    </span>
                  </span>
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="__no-results">
                No matching vendors
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

function PerformanceRoute() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const indexQuery = usePerformanceIndexQuery()
  const selectedVendorId = indexQuery.data?.items.some(
    (item) => item.id === search.vendorId
  )
    ? search.vendorId
    : indexQuery.data?.items[0]?.id
  const performanceQuery = useVendorPerformanceQuery(selectedVendorId)

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 lg:p-6">
      <div>
        <p className="text-sm text-muted-foreground">Vendor intelligence</p>
        <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
          Vendor Performance
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Evaluate vendor quality, delivery, responsiveness, financial history
          and operational risk in one view.
        </p>
      </div>

      {indexQuery.isPending ? (
        <PerformanceLoading />
      ) : indexQuery.isError ? (
        <PerformanceError
          error={indexQuery.error}
          onRetry={() => void indexQuery.refetch()}
        />
      ) : indexQuery.data.total === 0 ? (
        <Empty className="min-h-96 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ActivityIcon />
            </EmptyMedia>
            <EmptyTitle>No performance data available</EmptyTitle>
            <EmptyDescription>
              Performance profiles will appear after vendors are created.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <VendorSelector
            items={indexQuery.data.items}
            onSelect={(vendorId) =>
              void navigate({ to: "/performance", search: { vendorId } })
            }
            selectedVendorId={selectedVendorId}
          />

          {performanceQuery.isPending ? (
            <PerformanceDetailsLoading />
          ) : performanceQuery.isError ? (
            <PerformanceError
              error={performanceQuery.error}
              onRetry={() => void performanceQuery.refetch()}
            />
          ) : performanceQuery.data ? (
            <div className="grid gap-6">
              <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-xl font-medium">
                      {performanceQuery.data.vendor.name}
                    </h3>
                    <Badge
                      variant={statusVariant[performanceQuery.data.vendor.status]}
                    >
                      {performanceQuery.data.vendor.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-mono">
                      {performanceQuery.data.vendor.code}
                    </span>
                    <span>{performanceQuery.data.vendor.category}</span>
                    <span>{performanceQuery.data.vendor.city}</span>
                  </div>
                </div>
                <Button
                  render={
                    <Link
                      params={{ vendorId: performanceQuery.data.vendor.id }}
                      to="/vendors/$vendorId"
                    />
                  }
                  variant="outline"
                >
                  <ExternalLinkIcon />
                  Open Vendor Details
                </Button>
              </div>

              <PerformanceMetrics metrics={performanceQuery.data.metrics} />
              <PerformanceTrendChart data={performanceQuery.data.trend} />
              <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                <PerformancePaymentHistory
                  payments={performanceQuery.data.paymentHistory}
                  summary={performanceQuery.data.paymentSummary}
                />
                <PerformanceRecentIssues
                  issues={performanceQuery.data.recentIssues}
                />
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  )
}

function PerformanceError({
  error,
  onRetry,
}: {
  error: Error
  onRetry: () => void
}) {
  const unauthorized =
    error instanceof ApiError && (error.status === 401 || error.status === 403)

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>
        {unauthorized
          ? "Performance access is restricted"
          : "Performance data is unavailable"}
      </AlertTitle>
      <AlertDescription>
        {unauthorized
          ? "Your account does not have permission to view vendor performance."
          : error.message}
      </AlertDescription>
      {!unauthorized ? (
        <AlertAction>
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCwIcon />
            Retry
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  )
}

function PerformanceLoading() {
  return (
    <div aria-label="Loading vendor performance" aria-live="polite" className="grid gap-6">
      <Skeleton className="h-32" />
      <PerformanceDetailsLoading />
    </div>
  )
}

function PerformanceDetailsLoading() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-24" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className="h-36" key={index} />
        ))}
      </div>
      <Skeleton className="h-[420px]" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}
