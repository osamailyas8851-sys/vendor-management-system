import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  ChartNoAxesCombinedIcon,
  CircleAlertIcon,
  ClipboardCheckIcon,
  MapPinIcon,
  RefreshCwIcon,
  StarIcon,
} from "lucide-react"
import { z } from "zod"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useVendorDetailsQuery } from "@/features/vendors/api/vendors.queries"
import { VendorDetailsTabs } from "@/features/vendors/components/vendor-details-tabs"
import type { VendorStatus } from "@/features/vendors/types"

const vendorDetailsSearchSchema = z.object({
  tab: z
    .enum([
      "overview",
      "contacts",
      "performance",
      "purchases",
      "documents",
      "payments",
      "projects",
      "issues",
      "audit",
    ])
    .optional(),
})

export const Route = createFileRoute("/vendors_/$vendorId")({
  component: VendorDetailsRoute,
  validateSearch: vendorDetailsSearchSchema,
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

function VendorDetailsRoute() {
  const { vendorId } = Route.useParams()
  const { tab } = Route.useSearch()
  const vendorDetailsQuery = useVendorDetailsQuery(vendorId)

  if (vendorDetailsQuery.isPending) {
    return <VendorDetailsLoading />
  }

  if (vendorDetailsQuery.isError) {
    return (
      <main className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
        <Button
          className="w-fit"
          render={<Link to="/vendors" />}
          variant="ghost"
        >
          <ArrowLeftIcon />
          Back to vendors
        </Button>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Vendor details are unavailable</AlertTitle>
          <AlertDescription>{vendorDetailsQuery.error.message}</AlertDescription>
          <AlertAction>
            <Button
              onClick={() => void vendorDetailsQuery.refetch()}
              size="sm"
              variant="outline"
            >
              <RefreshCwIcon />
              Retry
            </Button>
          </AlertAction>
        </Alert>
      </main>
    )
  }

  const { vendor } = vendorDetailsQuery.data

  return (
    <main className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
      <Button
        className="w-fit"
        render={<Link to="/vendors" />}
        variant="ghost"
      >
        <ArrowLeftIcon />
        Back to vendors
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl font-medium tracking-tight sm:text-3xl">
              {vendor.name}
            </h2>
            <Badge variant={statusVariant[vendor.status]}>{vendor.status}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="font-mono">{vendor.code}</span>
            <span>{vendor.category}</span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              {vendor.city}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            render={
              <Link search={{ vendorId: vendor.id }} to="/performance" />
            }
            variant="outline"
          >
            <ChartNoAxesCombinedIcon />
            View Performance
          </Button>
          <Button
            render={
              <Link
                params={{ vendorId: vendor.id }}
                to="/approvals/$vendorId"
              />
            }
            variant="outline"
          >
            <ClipboardCheckIcon />
            Review Approval
          </Button>
          <div className="flex w-fit items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <StarIcon className="size-4 fill-current text-amber-500" />
            <span className="font-medium tabular-nums">
              {vendor.rating > 0 ? vendor.rating.toFixed(1) : "Unrated"}
            </span>
            {vendor.rating > 0 ? (
              <span className="text-xs text-muted-foreground">out of 5</span>
            ) : null}
          </div>
        </div>
      </div>

      <VendorDetailsTabs data={vendorDetailsQuery.data} initialTab={tab} />
    </main>
  )
}

function VendorDetailsLoading() {
  return (
    <main
      aria-label="Loading vendor details"
      aria-live="polite"
      className="flex flex-1 flex-col gap-5 p-4 lg:p-6"
    >
      <Skeleton className="h-8 w-36" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-28" key={index} />
        ))}
      </div>
      <Skeleton className="h-80" />
    </main>
  )
}
