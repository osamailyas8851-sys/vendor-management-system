import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { dashboardQueryOptions } from "@/features/dashboard/api/dashboard.queries"
import {
  createVendor,
  getVendorComparison,
  getVendorDetails,
  getVendors,
} from "@/features/vendors/api/vendors.service"

export const vendorQueryKeys = {
  all: ["vendors"] as const,
  comparison: (vendorIds: string[]) =>
    ["vendors", "comparison", ...vendorIds] as const,
  detail: (vendorId: string) => ["vendors", "detail", vendorId] as const,
}

export function useVendorComparisonQuery(vendorIds: string[]) {
  return useQuery({
    enabled: vendorIds.length >= 2,
    queryKey: vendorQueryKeys.comparison(vendorIds),
    queryFn: ({ signal }) => getVendorComparison(vendorIds, signal),
  })
}

export const vendorsQueryOptions = queryOptions({
  queryKey: vendorQueryKeys.all,
  queryFn: ({ signal }) => getVendors(signal),
})

export function useVendorsQuery() {
  return useQuery(vendorsQueryOptions)
}

export function vendorDetailsQueryOptions(vendorId: string) {
  return queryOptions({
    queryKey: vendorQueryKeys.detail(vendorId),
    queryFn: ({ signal }) => getVendorDetails(vendorId, signal),
  })
}

export function useVendorDetailsQuery(vendorId: string) {
  return useQuery(vendorDetailsQueryOptions(vendorId))
}

export function useCreateVendorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVendor,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["approvals"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["performance"] }),
        queryClient.invalidateQueries({ queryKey: vendorQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryOptions.queryKey,
        }),
      ])
    },
  })
}
