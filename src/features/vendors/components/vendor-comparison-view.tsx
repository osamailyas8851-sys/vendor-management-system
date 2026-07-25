import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  AwardIcon,
  BadgeIndianRupeeIcon,
  Building2Icon,
  CheckCircle2Icon,
  CircleAlertIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  StarIcon,
  Trash2Icon,
  TruckIcon,
} from "lucide-react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useVendorComparisonQuery,
  useVendorsQuery,
} from "@/features/vendors/api/vendors.queries"
import type {
  VendorComparisonItem,
  VendorStatus,
} from "@/features/vendors/types"
import { cn } from "@/lib/utils"

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency",
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

const riskClasses: Record<VendorComparisonItem["riskLevel"], string> = {
  Critical: "text-red-700 bg-red-50 border-red-200",
  High: "text-orange-700 bg-orange-50 border-orange-200",
  Low: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Medium: "text-amber-700 bg-amber-50 border-amber-200",
}

type MetricRowProps = {
  bestIds?: Set<string>
  items: VendorComparisonItem[]
  label: string
  renderValue: (item: VendorComparisonItem) => React.ReactNode
}

function MetricRow({ bestIds, items, label, renderValue }: MetricRowProps) {
  return (
    <div className="contents">
      <div className="flex min-h-16 items-center border-t bg-card px-4 py-3 font-medium sm:sticky sm:left-0 sm:z-10 sm:shadow-[1px_0_0_var(--border)]">
        {label}
      </div>
      {items.map((item) => (
        <div
          className={cn(
            "flex min-h-16 items-center border-t px-4 py-3",
            bestIds?.has(item.id) && "bg-primary/[0.045]"
          )}
          key={`${label}-${item.id}`}
        >
          <div className="min-w-0">
            {renderValue(item)}
            {bestIds?.has(item.id) ? (
              <span className="mt-1 flex items-center gap-1 text-xs font-medium text-primary">
                <CheckCircle2Icon className="size-3.5" />
                Best in comparison
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function bestIds(
  items: VendorComparisonItem[],
  value: (item: VendorComparisonItem) => number,
  direction: "highest" | "lowest"
) {
  if (!items.length) return new Set<string>()

  const values = items.map(value)
  const bestValue = direction === "highest" ? Math.max(...values) : Math.min(...values)

  return new Set(items.filter((item) => value(item) === bestValue).map((item) => item.id))
}

export function VendorComparisonView() {
  const vendorsQuery = useVendorsQuery()
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const initialized = React.useRef(false)

  React.useEffect(() => {
    if (!vendorsQuery.data || initialized.current) return

    initialized.current = true
    setSelectedIds(
      [...vendorsQuery.data.items]
        .filter((vendor) => vendor.rating > 0)
        .sort((left, right) => right.totalPurchase - left.totalPurchase)
        .slice(0, 3)
        .map((vendor) => vendor.id)
    )
  }, [vendorsQuery.data])

  const comparisonQuery = useVendorComparisonQuery(selectedIds)
  const vendors = vendorsQuery.data?.items ?? []

  const replaceVendor = (currentId: string, nextId: string | null) => {
    if (!nextId || selectedIds.includes(nextId)) return
    setSelectedIds((current) =>
      current.map((vendorId) => (vendorId === currentId ? nextId : vendorId))
    )
  }

  const addVendor = (vendorId: string | null) => {
    if (!vendorId || selectedIds.includes(vendorId) || selectedIds.length >= 4) {
      return
    }
    setSelectedIds((current) => [...current, vendorId])
  }

  const removeVendor = (vendorId: string) => {
    setSelectedIds((current) => current.filter((id) => id !== vendorId))
  }

  if (vendorsQuery.isPending) {
    return <ComparisonLoading />
  }

  if (vendorsQuery.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Vendors are unavailable</AlertTitle>
        <AlertDescription>{vendorsQuery.error.message}</AlertDescription>
        <AlertAction>
          <Button onClick={() => void vendorsQuery.refetch()} size="sm" variant="outline">
            <RefreshCwIcon />
            Retry
          </Button>
        </AlertAction>
      </Alert>
    )
  }

  return (
    <div className="grid w-full min-w-0 max-w-full gap-5 overflow-x-hidden">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Choose vendors</CardTitle>
          <CardDescription>
            Select two to four vendors. Every comparison is calculated from the mock API data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {selectedIds.map((vendorId, index) => {
            const vendor = vendors.find((item) => item.id === vendorId)

            return (
              <div className="grid gap-1.5" key={vendorId}>
                <label className="text-xs font-medium text-muted-foreground">
                  Vendor {index + 1}
                </label>
                <div className="flex min-w-0 gap-2">
                  <Select
                    value={vendorId}
                    onValueChange={(value) => replaceVendor(vendorId, value)}
                  >
                    <SelectTrigger
                      aria-label={`Select vendor ${index + 1}`}
                      className="min-w-0 flex-1"
                    >
                      <SelectValue>{vendor?.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((option) => (
                        <SelectItem
                          disabled={selectedIds.includes(option.id) && option.id !== vendorId}
                          key={option.id}
                          value={option.id}
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    aria-label={`Remove ${vendor?.name ?? "vendor"}`}
                    disabled={selectedIds.length <= 2}
                    onClick={() => removeVendor(vendorId)}
                    size="icon"
                    variant="outline"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            )
          })}

          {selectedIds.length < 4 ? (
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Add another vendor
              </label>
              <Select value={null} onValueChange={addVendor}>
                <SelectTrigger aria-label="Add vendor to comparison" className="w-full">
                  <PlusIcon />
                  <SelectValue>Add vendor</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem
                      disabled={selectedIds.includes(vendor.id)}
                      key={vendor.id}
                      value={vendor.id}
                    >
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selectedIds.length < 2 ? (
        <Card>
          <CardContent className="grid min-h-48 place-items-center text-center">
            <div>
              <Building2Icon className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Select at least two vendors</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add one more vendor to start the side-by-side comparison.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : comparisonQuery.isPending ? (
        <Skeleton className="h-[620px] rounded-xl" />
      ) : comparisonQuery.isError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Comparison is unavailable</AlertTitle>
          <AlertDescription>{comparisonQuery.error.message}</AlertDescription>
          <AlertAction>
            <Button onClick={() => void comparisonQuery.refetch()} size="sm" variant="outline">
              <RefreshCwIcon />
              Retry
            </Button>
          </AlertAction>
        </Alert>
      ) : comparisonQuery.data.items.length ? (
        <ComparisonMatrix items={comparisonQuery.data.items} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No comparison data is available for these vendors.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ComparisonMatrix({ items }: { items: VendorComparisonItem[] }) {
  const gridTemplateColumns = `170px repeat(${items.length}, minmax(240px, 1fr))`
  const minimumWidth = 170 + items.length * 240

  return (
    <Card className="w-full min-w-0 max-w-full">
      <CardHeader className="border-b">
        <CardTitle>Side-by-side comparison</CardTitle>
        <CardDescription>
          Scroll horizontally to review every vendor on smaller screens.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 p-0">
        <div className="w-full min-w-0 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain">
          <div
            className="grid max-w-none"
            style={{
              gridTemplateColumns,
              minWidth: "100%",
              width: `${minimumWidth}px`,
            }}
          >
            <div className="flex items-start bg-muted/30 p-4 sm:sticky sm:left-0 sm:z-20 sm:shadow-[1px_0_0_var(--border)]">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Metrics
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Compare each vendor by category
                </p>
              </div>
            </div>
            {items.map((item) => (
              <div className="border-l p-4 first:border-l-0" key={item.id}>
                <div className="flex min-h-32 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2Icon className="size-4" />
                    </div>
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                  </div>
                  <Link
                    className="mt-3 font-heading text-base font-medium hover:text-primary hover:underline"
                    params={{ vendorId: item.id }}
                    to="/vendors/$vendorId"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.code} · {item.category} · {item.city}
                  </p>
                </div>
              </div>
            ))}

            <div className="col-span-full flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <BadgeIndianRupeeIcon className="size-3.5" />
              Pricing & commercials
            </div>
            <MetricRow
              items={items}
              label="Average order value"
              renderValue={(item) => (
                <span className="font-medium tabular-nums">
                  {currencyFormatter.format(item.averageOrderValue)}
                </span>
              )}
            />
            <MetricRow
              items={items}
              label="Total purchase value"
              renderValue={(item) => (
                <span className="font-medium tabular-nums">
                  {currencyFormatter.format(item.totalPurchaseValue)}
                </span>
              )}
            />
            <MetricRow
              items={items}
              label="Payment terms"
              renderValue={(item) => item.paymentTerms}
            />
            <MetricRow
              items={items}
              label="Purchase orders"
              renderValue={(item) => `${item.orderCount.toLocaleString("en-IN")} orders`}
            />

            <div className="col-span-full flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <TruckIcon className="size-3.5" />
              Performance
            </div>
            <MetricRow
              bestIds={bestIds(items, (item) => item.rating, "highest")}
              items={items}
              label="Vendor rating"
              renderValue={(item) => (
                <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                  <StarIcon className="size-4 fill-current text-amber-500" />
                  {item.rating ? `${item.rating.toFixed(1)} / 5` : "Unrated"}
                </span>
              )}
            />
            <MetricRow
              bestIds={bestIds(items, (item) => item.deliveryScore, "highest")}
              items={items}
              label="Delivery performance"
              renderValue={(item) => (
                <div className="w-full max-w-44">
                  <div className="flex items-center justify-between gap-3 font-medium tabular-nums">
                    <span>{item.deliveryScore}%</span>
                    <span className="text-xs text-muted-foreground">on-time score</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.deliveryScore}%` }}
                    />
                  </div>
                </div>
              )}
            />

            <div className="col-span-full flex items-center gap-2 border-t bg-muted/40 px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <AwardIcon className="size-3.5" />
              Compliance
            </div>
            <MetricRow
              items={items}
              label="Certifications"
              renderValue={(item) => (
                <div className="flex flex-wrap gap-1.5">
                  {item.certifications.length ? (
                    item.certifications.map((certification) => (
                      <Badge key={certification} variant="outline">
                        <AwardIcon />
                        {certification}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">None recorded</span>
                  )}
                </div>
              )}
            />
            <MetricRow
              bestIds={bestIds(items, (item) => item.riskScore, "lowest")}
              items={items}
              label="Risk score"
              renderValue={(item) => (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium tabular-nums">{item.riskScore} / 100</span>
                  <Badge
                    className={cn("border", riskClasses[item.riskLevel])}
                    variant="outline"
                  >
                    <ShieldCheckIcon />
                    {item.riskLevel} risk
                  </Badge>
                </div>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ComparisonLoading() {
  return (
    <div className="grid gap-5" aria-label="Loading vendor comparison">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-[620px] rounded-xl" />
    </div>
  )
}
