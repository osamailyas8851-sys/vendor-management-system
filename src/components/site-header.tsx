import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { useRouterState } from "@tanstack/react-router"
import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { dashboardQueryOptions } from "@/features/dashboard/api/dashboard.queries"
import { approvalQueryKeys } from "@/features/approvals/api/approvals.queries"
import { performanceQueryKeys } from "@/features/performance/api/performance.queries"
import { notificationQueryKeys } from "@/features/notifications/api/notifications.queries"
import { vendorQueryKeys } from "@/features/vendors/api/vendors.queries"

export function SiteHeader() {
  const queryClient = useQueryClient()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isVendorArea = pathname.startsWith("/vendors")
  const isApprovalArea = pathname.startsWith("/approvals")
  const isPerformanceArea = pathname.startsWith("/performance")
  const isNotificationsArea = pathname.startsWith("/notifications")
  const isCreateVendor = pathname === "/vendors/new"
  const isVendorDetails =
    isVendorArea && pathname !== "/vendors" && !isCreateVendor
  const isApprovalDetails = isApprovalArea && pathname !== "/approvals"
  const activeQueryKey = isNotificationsArea
    ? notificationQueryKeys.all
    : isPerformanceArea
    ? performanceQueryKeys.all
    : isApprovalArea
      ? approvalQueryKeys.all
      : isVendorArea
        ? vendorQueryKeys.all
        : dashboardQueryOptions.queryKey
  const isRefreshing = useIsFetching({ queryKey: activeQueryKey }) > 0
  const pageTitle = isNotificationsArea
    ? "Notifications"
    : isPerformanceArea
      ? "Vendor Performance"
      : isApprovalDetails
        ? "Approval Review"
        : isApprovalArea
          ? "Approval Workflow"
          : isCreateVendor
            ? "Create Vendor"
            : isVendorDetails
              ? "Vendor Details"
              : isVendorArea
                ? "Vendor Directory"
                : "Vendor Dashboard"

  const refreshPageData = () => {
    void queryClient.invalidateQueries({
      queryKey: activeQueryKey,
    })
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur md:rounded-t-xl">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 h-4 data-vertical:self-auto"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-base font-medium">
            {pageTitle}
          </h1>
        </div>
        <Button
          aria-label={`Refresh ${pageTitle.toLowerCase()} data`}
          disabled={isRefreshing}
          onClick={refreshPageData}
          size="sm"
          variant="outline"
        >
          <RefreshCwIcon className={isRefreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">
            {isRefreshing ? "Refreshing" : "Refresh"}
          </span>
        </Button>
      </div>
    </header>
  )
}
