import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { dashboardQueryOptions } from "@/features/dashboard/api/dashboard.queries"
import {
  addApprovalComment,
  getApprovalDetails,
  getApprovals,
  submitApprovalAction,
} from "@/features/approvals/api/approvals.service"
import type {
  AddApprovalCommentInput,
  ApprovalActionInput,
} from "@/features/approvals/types"
import { vendorQueryKeys } from "@/features/vendors/api/vendors.queries"

export const approvalQueryKeys = {
  all: ["approvals"] as const,
  list: ["approvals", "list"] as const,
  detail: (vendorId: string) => ["approvals", "detail", vendorId] as const,
}

export const approvalsQueryOptions = queryOptions({
  queryKey: approvalQueryKeys.list,
  queryFn: ({ signal }) => getApprovals(signal),
})

export function useApprovalsQuery() {
  return useQuery(approvalsQueryOptions)
}

export function approvalDetailsQueryOptions(vendorId: string) {
  return queryOptions({
    queryKey: approvalQueryKeys.detail(vendorId),
    queryFn: ({ signal }) => getApprovalDetails(vendorId, signal),
  })
}

export function useApprovalDetailsQuery(vendorId: string) {
  return useQuery(approvalDetailsQueryOptions(vendorId))
}

function invalidateApprovalConsumers(
  queryClient: ReturnType<typeof useQueryClient>,
  vendorId: string
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    queryClient.invalidateQueries({ queryKey: ["performance"] }),
    queryClient.invalidateQueries({ queryKey: approvalQueryKeys.list }),
    queryClient.invalidateQueries({ queryKey: vendorQueryKeys.all }),
    queryClient.invalidateQueries({
      queryKey: vendorQueryKeys.detail(vendorId),
    }),
    queryClient.invalidateQueries({
      queryKey: dashboardQueryOptions.queryKey,
    }),
  ])
}

export function useApprovalActionMutation(vendorId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ApprovalActionInput) =>
      submitApprovalAction(vendorId, input),
    onSuccess: async (data) => {
      queryClient.setQueryData(approvalQueryKeys.detail(vendorId), data)
      await invalidateApprovalConsumers(queryClient, vendorId)
    },
  })
}

export function useAddApprovalCommentMutation(vendorId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddApprovalCommentInput) =>
      addApprovalComment(vendorId, input),
    onSuccess: async (data) => {
      queryClient.setQueryData(approvalQueryKeys.detail(vendorId), data)
      await invalidateApprovalConsumers(queryClient, vendorId)
    },
  })
}
