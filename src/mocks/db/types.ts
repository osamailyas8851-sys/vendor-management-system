import type { VendorPerformancePoint } from "@/features/dashboard/types"
import type { VendorApproval } from "@/features/approvals/types"
import type { VendorNotification } from "@/features/notifications/types"
import type { Vendor, VendorProfile } from "@/features/vendors/types"

export type PurchaseOrderStatus = "Active" | "Completed"

export type PurchaseOrder = {
  createdAt: string
  id: string
  status: PurchaseOrderStatus
  value: number
  vendorId: string
}

export type MockDatabase = {
  approvals: Record<string, VendorApproval>
  notifications: VendorNotification[]
  performanceHistory: VendorPerformancePoint[]
  purchaseOrders: PurchaseOrder[]
  updatedAt: string
  vendorProfiles: Record<string, VendorProfile>
  vendors: Vendor[]
  version: 6
}
