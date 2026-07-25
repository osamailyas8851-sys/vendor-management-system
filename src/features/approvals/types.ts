import type { Vendor, VendorDocument } from "@/features/vendors/types"

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "On Hold"

export type ApprovalAction =
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Changes Requested"
  | "Comment Added"

export type ApprovalTimelineEvent = {
  action: ApprovalAction
  actor: string
  actorRole: string
  comment?: string
  createdAt: string
  fromStatus: ApprovalStatus | null
  id: string
  toStatus: ApprovalStatus
}

export type ApprovalComment = {
  author: string
  authorRole: string
  createdAt: string
  id: string
  message: string
}

export type VendorApproval = {
  assignedReviewer: string
  comments: ApprovalComment[]
  status: ApprovalStatus
  submittedAt: string
  submittedBy: string
  timeline: ApprovalTimelineEvent[]
  updatedAt: string
  vendorId: string
}

export type ApprovalListItem = {
  assignedReviewer: string
  category: string
  city: string
  code: string
  status: ApprovalStatus
  submittedAt: string
  submittedBy: string
  updatedAt: string
  vendorId: string
  vendorName: string
}

export type ApprovalListResponse = {
  counts: Record<ApprovalStatus, number>
  items: ApprovalListItem[]
  total: number
}

export type ApprovalDetailsResponse = {
  approval: VendorApproval
  documents: VendorDocument[]
  vendor: Vendor
}

export type ApprovalDecision = "approve" | "reject" | "request_changes"

export type ApprovalActionInput = {
  action: ApprovalDecision
  comment?: string
}

export type AddApprovalCommentInput = {
  message: string
}
