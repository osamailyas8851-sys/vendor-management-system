import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CircleAlertIcon,
  ScaleIcon,
  PlusIcon,
  RefreshCwIcon,
  UsersRoundIcon,
} from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useVendorsQuery } from "@/features/vendors/api/vendors.queries"
import { VendorDirectoryTable } from "@/features/vendors/components/vendor-directory-table"

export const Route = createFileRoute("/vendors")({
  component: VendorDirectoryRoute,
})

function VendorDirectoryRoute() {
  const vendorsQuery = useVendorsQuery()

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Vendor management</p>
          <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight">
            Vendor Directory
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Search, filter and review the complete enterprise vendor network.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {vendorsQuery.data ? (
            <Badge className="w-fit" variant="outline">
              <UsersRoundIcon />
              {vendorsQuery.data.total.toLocaleString("en-IN")} vendors
            </Badge>
          ) : null}
          <Button render={<Link to="/vendors/compare" />} variant="outline">
            <ScaleIcon />
            Compare Vendors
          </Button>
          <Button render={<Link to="/vendors/new" />}>
            <PlusIcon />
            Add Vendor
          </Button>
        </div>
      </div>

      {vendorsQuery.isPending ? (
        <VendorDirectoryLoading />
      ) : vendorsQuery.isError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Vendor directory is unavailable</AlertTitle>
          <AlertDescription>{vendorsQuery.error.message}</AlertDescription>
          <AlertAction>
            <Button
              onClick={() => void vendorsQuery.refetch()}
              size="sm"
              variant="outline"
            >
              <RefreshCwIcon />
              Retry
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <VendorDirectoryTable data={vendorsQuery.data.items} />
      )}
    </main>
  )
}

function VendorDirectoryLoading() {
  return (
    <div aria-label="Loading vendor directory" aria-live="polite">
      <div className="rounded-xl border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-full sm:w-96" />
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-8" key={index} />
          ))}
        </div>
        <Skeleton className="mt-5 h-[520px]" />
      </div>
    </div>
  )
}
