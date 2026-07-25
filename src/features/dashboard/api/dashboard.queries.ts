import { queryOptions, useQuery } from "@tanstack/react-query"

import { getDashboard } from "@/features/dashboard/api/dashboard.service"

export const dashboardQueryOptions = queryOptions({
  queryKey: ["dashboard"],
  queryFn: ({ signal }) => getDashboard(signal),
})

export function useDashboardQuery() {
  return useQuery(dashboardQueryOptions)
}
