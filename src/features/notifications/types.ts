export type NotificationType =
  | "Approval Pending"
  | "Document Expiring"
  | "Low Vendor Rating"
  | "Delayed Delivery"
  | "Payment Due"

export type NotificationPriority = "Low" | "Medium" | "High" | "Critical"

export type VendorNotification = {
  createdAt: string
  description: string
  dueAt?: string
  id: string
  priority: NotificationPriority
  readAt: string | null
  title: string
  type: NotificationType
  vendorId: string
  vendorName: string
}

export type NotificationListResponse = {
  counts: Record<NotificationType, number>
  items: VendorNotification[]
  total: number
  unread: number
}
