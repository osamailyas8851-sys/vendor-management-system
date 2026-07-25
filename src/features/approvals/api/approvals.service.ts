import { apiClient } from "@/api/client"
import type {
  AddApprovalCommentInput,
  ApprovalActionInput,
  ApprovalDetailsResponse,
  ApprovalListResponse,
} from "@/features/approvals/types"

export async function getApprovals(
  signal?: AbortSignal
): Promise<ApprovalListResponse> {
  const response = await apiClient.get<ApprovalListResponse>("/approvals", {
    signal,
  })

  return response.data
}

export async function getApprovalDetails(
  vendorId: string,
  signal?: AbortSignal
): Promise<ApprovalDetailsResponse> {
  const response = await apiClient.get<ApprovalDetailsResponse>(
    `/approvals/${encodeURIComponent(vendorId)}`,
    { signal }
  )

  return response.data
}

export async function addApprovalComment(
  vendorId: string,
  input: AddApprovalCommentInput
): Promise<ApprovalDetailsResponse> {
  const response = await apiClient.post<ApprovalDetailsResponse>(
    `/approvals/${encodeURIComponent(vendorId)}/comments`,
    input
  )

  return response.data
}

export async function submitApprovalAction(
  vendorId: string,
  input: ApprovalActionInput
): Promise<ApprovalDetailsResponse> {
  const response = await apiClient.post<ApprovalDetailsResponse>(
    `/approvals/${encodeURIComponent(vendorId)}/actions`,
    input
  )

  return response.data
}
