import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notifications.service"

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: ["notifications", "list"] as const,
}

export const notificationsQueryOptions = queryOptions({
  queryKey: notificationQueryKeys.list,
  queryFn: ({ signal }) => getNotifications(signal),
})

export function useNotificationsQuery() {
  return useQuery(notificationsQueryOptions)
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationQueryKeys.list, data)
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationQueryKeys.list, data)
    },
  })
}
