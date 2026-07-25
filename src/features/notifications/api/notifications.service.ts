import { apiClient } from "@/api/client"
import type { NotificationListResponse } from "@/features/notifications/types"

export async function getNotifications(
  signal?: AbortSignal
): Promise<NotificationListResponse> {
  const response = await apiClient.get<NotificationListResponse>(
    "/notifications",
    { signal }
  )

  return response.data
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationListResponse> {
  const response = await apiClient.patch<NotificationListResponse>(
    `/notifications/${encodeURIComponent(notificationId)}/read`
  )

  return response.data
}

export async function markAllNotificationsRead(): Promise<NotificationListResponse> {
  const response = await apiClient.post<NotificationListResponse>(
    "/notifications/read-all"
  )

  return response.data
}
