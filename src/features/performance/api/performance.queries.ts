import { queryOptions, useQuery } from "@tanstack/react-query"

import {
  getPerformanceIndex,
  getVendorPerformance,
} from "@/features/performance/api/performance.service"

export const performanceQueryKeys = {
  all: ["performance"] as const,
  index: ["performance", "index"] as const,
  detail: (vendorId: string) => ["performance", "detail", vendorId] as const,
}

export const performanceIndexQueryOptions = queryOptions({
  queryKey: performanceQueryKeys.index,
  queryFn: ({ signal }) => getPerformanceIndex(signal),
})

export function usePerformanceIndexQuery() {
  return useQuery(performanceIndexQueryOptions)
}

export function vendorPerformanceQueryOptions(vendorId: string) {
  return queryOptions({
    queryKey: performanceQueryKeys.detail(vendorId),
    queryFn: ({ signal }) => getVendorPerformance(vendorId, signal),
  })
}

export function useVendorPerformanceQuery(vendorId?: string) {
  return useQuery({
    ...vendorPerformanceQueryOptions(vendorId ?? ""),
    enabled: Boolean(vendorId),
  })
}
