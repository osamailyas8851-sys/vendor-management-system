import { CircleAlertIcon, DatabaseZapIcon, RefreshCwIcon } from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardLoading() {
  return (
    <div aria-label="Loading dashboard" aria-live="polite" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @5xl/main:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-36 rounded-xl" key={index} />
        ))}
      </div>
      <div className="grid gap-4 px-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] lg:px-6">
        <Skeleton className="h-[380px] rounded-xl" />
        <Skeleton className="h-[380px] rounded-xl" />
      </div>
      <div className="grid gap-4 px-4 md:grid-cols-2 lg:px-6">
        <Skeleton className="h-[360px] rounded-xl" />
        <Skeleton className="h-[360px] rounded-xl" />
      </div>
      <Skeleton className="mx-4 h-80 rounded-xl lg:mx-6" />
    </div>
  )
}

type DashboardErrorProps = {
  message: string
  onRetry: () => void
}

export function DashboardError({
  message,
  onRetry,
}: DashboardErrorProps) {
  return (
    <div className="px-4 lg:px-6">
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Dashboard data is unavailable</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        <AlertAction>
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCwIcon />
            Retry
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}

type DashboardEmptyProps = {
  onRefresh: () => void
}

export function DashboardEmpty({ onRefresh }: DashboardEmptyProps) {
  return (
    <div className="px-4 lg:px-6">
      <Empty className="min-h-96 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <DatabaseZapIcon />
          </EmptyMedia>
          <EmptyTitle>No dashboard data yet</EmptyTitle>
          <EmptyDescription>
            Vendor metrics will appear after the first vendor is added.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCwIcon />
            Refresh data
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
