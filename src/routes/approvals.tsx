import { createFileRoute } from "@tanstack/react-router"
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  CircleXIcon,
  Clock3Icon,
  InboxIcon,
  PauseCircleIcon,
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
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useApprovalsQuery } from "@/features/approvals/api/approvals.queries"
import { ApprovalQueueTable } from "@/features/approvals/components/approval-queue-table"
import type { ApprovalListResponse } from "@/features/approvals/types"

export const Route = createFileRoute("/approvals")({
  component: ApprovalsRoute,
})

const summaryCards = [
  { status: "Pending", label: "Pending review", icon: Clock3Icon },
  { status: "Approved", label: "Approved", icon: CircleCheckBigIcon },
  { status: "Rejected", label: "Rejected", icon: CircleXIcon },
  { status: "On Hold", label: "On hold", icon: PauseCircleIcon },
] as const

function ApprovalSummary({ data }: { data: ApprovalListResponse }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map(({ status, label, icon: Icon }) => (
        <Card key={status}>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 font-heading text-2xl font-medium tabular-nums">
                {data.counts[status].toLocaleString("en-IN")}
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

function ApprovalsRoute() {
  const approvalsQuery = useApprovalsQuery()

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 lg:p-6">
      <div>
        <p className="text-sm text-muted-foreground">Vendor governance</p>
        <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
          Approval Workflow
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Review vendor onboarding submissions, capture decisions and maintain
          a complete approval history.
        </p>
      </div>

      {approvalsQuery.isPending ? (
        <ApprovalQueueLoading />
      ) : approvalsQuery.isError ? (
        <ApprovalQueueError
          error={approvalsQuery.error}
          onRetry={() => void approvalsQuery.refetch()}
        />
      ) : approvalsQuery.data.total === 0 ? (
        <Empty className="min-h-96 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>No vendor approvals yet</EmptyTitle>
            <EmptyDescription>
              New vendor submissions will appear here for review.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ApprovalSummary data={approvalsQuery.data} />
          <ApprovalQueueTable data={approvalsQuery.data.items} />
        </>
      )}
    </main>
  )
}

function ApprovalQueueError({
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
          ? "Approval access is restricted"
          : "Approval queue is unavailable"}
      </AlertTitle>
      <AlertDescription>
        {unauthorized
          ? "Your account does not have permission to review vendor approvals."
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

function ApprovalQueueLoading() {
  return (
    <div aria-label="Loading approval queue" aria-live="polite" className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-24" key={index} />
        ))}
      </div>
      <Skeleton className="h-[560px]" />
    </div>
  )
}
