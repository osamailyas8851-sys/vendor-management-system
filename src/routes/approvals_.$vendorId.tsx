import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  CircleAlertIcon,
  MapPinIcon,
  RefreshCwIcon,
} from "lucide-react"

import { ApiError } from "@/api/client"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useApprovalDetailsQuery } from "@/features/approvals/api/approvals.queries"
import { ApprovalReview } from "@/features/approvals/components/approval-review"
import { ApprovalStatusBadge } from "@/features/approvals/components/approval-status-badge"

export const Route = createFileRoute("/approvals_/$vendorId")({
  component: ApprovalDetailsRoute,
})

function ApprovalDetailsRoute() {
  const { vendorId } = Route.useParams()
  const approvalQuery = useApprovalDetailsQuery(vendorId)

  if (approvalQuery.isPending) return <ApprovalDetailsLoading />

  if (approvalQuery.isError) {
    const unauthorized =
      approvalQuery.error instanceof ApiError &&
      (approvalQuery.error.status === 401 || approvalQuery.error.status === 403)

    return (
      <main className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
        <Button
          className="w-fit"
          render={<Link to="/approvals" />}
          variant="ghost"
        >
          <ArrowLeftIcon />
          Back to approvals
        </Button>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>
            {unauthorized
              ? "Approval access is restricted"
              : "Approval details are unavailable"}
          </AlertTitle>
          <AlertDescription>
            {unauthorized
              ? "Your account does not have permission to review this vendor."
              : approvalQuery.error.message}
          </AlertDescription>
          {!unauthorized ? (
            <AlertAction>
              <Button
                onClick={() => void approvalQuery.refetch()}
                size="sm"
                variant="outline"
              >
                <RefreshCwIcon />
                Retry
              </Button>
            </AlertAction>
          ) : null}
        </Alert>
      </main>
    )
  }

  const { approval, vendor } = approvalQuery.data

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-5 p-4 lg:p-6">
      <Button
        className="w-fit"
        render={<Link to="/approvals" />}
        variant="ghost"
      >
        <ArrowLeftIcon />
        Back to approvals
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Approval review</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl font-medium tracking-tight sm:text-3xl">
              {vendor.name}
            </h2>
            <ApprovalStatusBadge status={approval.status} />
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
      </div>

      <ApprovalReview data={approvalQuery.data} />
    </main>
  )
}

function ApprovalDetailsLoading() {
  return (
    <main
      aria-label="Loading approval details"
      aria-live="polite"
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 lg:p-6"
    >
      <Skeleton className="h-8 w-36" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-96 max-w-full" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-5">
          <Skeleton className="h-72" />
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </div>
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </main>
  )
}
