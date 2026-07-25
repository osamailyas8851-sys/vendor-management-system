import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  BellIcon,
  CheckCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  ClipboardClockIcon,
  FileWarningIcon,
  RefreshCwIcon,
  SearchIcon,
  StarIcon,
  TruckIcon,
  WalletCardsIcon,
} from "lucide-react"

import { ApiError } from "@/api/client"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/api/notifications.queries"
import type {
  NotificationPriority,
  NotificationType,
  VendorNotification,
} from "@/features/notifications/types"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/notifications")({
  component: NotificationsRoute,
})

const notificationTypes = [
  {
    type: "Approval Pending",
    label: "Approval Pending",
    icon: ClipboardClockIcon,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    type: "Document Expiring",
    label: "Document Expiring",
    icon: FileWarningIcon,
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    type: "Low Vendor Rating",
    label: "Low Vendor Rating",
    icon: StarIcon,
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  {
    type: "Delayed Delivery",
    label: "Delayed Delivery",
    icon: TruckIcon,
    className: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    type: "Payment Due",
    label: "Payment Due",
    icon: WalletCardsIcon,
    className: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
] as const satisfies ReadonlyArray<{
  className: string
  icon: typeof BellIcon
  label: string
  type: NotificationType
}>

const priorityVariant: Record<
  NotificationPriority,
  "destructive" | "outline" | "secondary"
> = {
  Critical: "destructive",
  High: "destructive",
  Low: "secondary",
  Medium: "outline",
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  year: "numeric",
})

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function getTypeConfig(type: NotificationType) {
  return notificationTypes.find((item) => item.type === type)!
}

function getActionLabel(type: NotificationType) {
  if (type === "Approval Pending") return "Review Approval"
  if (type === "Low Vendor Rating" || type === "Delayed Delivery") {
    return "Review Performance"
  }
  if (type === "Document Expiring") return "View Documents"
  return "View Payment"
}

function NotificationItem({
  notification,
  onMarkRead,
  onOpen,
  reading,
}: {
  notification: VendorNotification
  onMarkRead: (notificationId: string) => void
  onOpen: (notification: VendorNotification) => void
  reading: boolean
}) {
  const config = getTypeConfig(notification.type)
  const Icon = config.icon
  const unread = !notification.readAt

  return (
    <article
      className={cn(
        "grid gap-4 p-4 transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start",
        unread && "bg-primary/[0.035]"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          config.className
        )}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {unread ? (
            <span aria-label="Unread" className="size-2 rounded-full bg-primary" />
          ) : null}
          <h3 className="font-medium">{notification.title}</h3>
          <Badge variant={priorityVariant[notification.priority]}>
            {notification.priority}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {notification.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{notification.vendorName}</span>
          <time>{dateTimeFormatter.format(new Date(notification.createdAt))}</time>
          {notification.dueAt ? (
            <span>Due {dateFormatter.format(new Date(notification.dueAt))}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        {unread ? (
          <Button
            aria-label={`Mark ${notification.title} as read`}
            disabled={reading}
            onClick={() => onMarkRead(notification.id)}
            size="icon"
            title="Mark as read"
            variant="ghost"
          >
            <CheckIcon />
          </Button>
        ) : null}
        <Button onClick={() => onOpen(notification)} variant="outline">
          {getActionLabel(notification.type)}
        </Button>
      </div>
    </article>
  )
}

function NotificationsRoute() {
  const navigate = useNavigate()
  const notificationsQuery = useNotificationsQuery()
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllMutation = useMarkAllNotificationsReadMutation()
  const [search, setSearch] = React.useState("")
  const [type, setType] = React.useState<NotificationType | "all">("all")
  const [readFilter, setReadFilter] = React.useState<"all" | "read" | "unread">(
    "all"
  )

  if (notificationsQuery.isPending) return <NotificationsLoading />

  if (notificationsQuery.isError) {
    return (
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 lg:p-6">
        <NotificationsHeading />
        <NotificationsError
          error={notificationsQuery.error}
          onRetry={() => void notificationsQuery.refetch()}
        />
      </main>
    )
  }

  const data = notificationsQuery.data
  const normalizedSearch = search.trim().toLowerCase()
  const filteredNotifications = data.items.filter((notification) => {
    const matchesType = type === "all" || notification.type === type
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "unread" && !notification.readAt) ||
      (readFilter === "read" && Boolean(notification.readAt))
    const matchesSearch =
      !normalizedSearch ||
      [
        notification.title,
        notification.description,
        notification.vendorName,
        notification.type,
      ].some((value) => value.toLowerCase().includes(normalizedSearch))

    return matchesType && matchesRead && matchesSearch
  })

  const markRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId, {
      onError: (error) => {
        toast.add({
          description: error.message,
          priority: "high",
          title: "Notification could not be updated",
          type: "error",
        })
      },
    })
  }

  const openNotification = (notification: VendorNotification) => {
    if (!notification.readAt) markRead(notification.id)

    if (notification.type === "Approval Pending") {
      void navigate({
        to: "/approvals/$vendorId",
        params: { vendorId: notification.vendorId },
      })
      return
    }

    if (
      notification.type === "Low Vendor Rating" ||
      notification.type === "Delayed Delivery"
    ) {
      void navigate({
        to: "/performance",
        search: { vendorId: notification.vendorId },
      })
      return
    }

    void navigate({
      to: "/vendors/$vendorId",
      params: { vendorId: notification.vendorId },
      search: {
        tab:
          notification.type === "Document Expiring"
            ? "documents"
            : "payments",
      },
    })
  }

  const markAllRead = async () => {
    try {
      await markAllMutation.mutateAsync()
      toast.add({
        description: "All notifications have been marked as read.",
        title: "Notifications updated",
        type: "success",
      })
    } catch (error) {
      toast.add({
        description:
          error instanceof Error ? error.message : "Please try again.",
        priority: "high",
        title: "Notifications could not be updated",
        type: "error",
      })
    }
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <NotificationsHeading />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{data.unread} unread</Badge>
          <Button
            disabled={data.unread === 0 || markAllMutation.isPending}
            onClick={() => void markAllRead()}
            variant="outline"
          >
            <CheckCheckIcon />
            {markAllMutation.isPending ? "Updating" : "Mark All as Read"}
          </Button>
        </div>
      </div>

      {data.total === 0 ? (
        <Empty className="min-h-96 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BellIcon />
            </EmptyMedia>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>
              Vendor alerts will appear here when attention is required.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {notificationTypes.map((item) => {
              const Icon = item.icon
              const selected = type === item.type

              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl bg-card p-4 text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/50",
                    selected && "ring-2 ring-primary"
                  )}
                  key={item.type}
                  onClick={() => setType(selected ? "all" : item.type)}
                  type="button"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-heading text-2xl font-medium tabular-nums">
                      {data.counts[item.type]}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      item.className
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                </button>
              )
            })}
          </section>

          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Notification Center</CardTitle>
                  <CardDescription>
                    {filteredNotifications.length} of {data.total} alerts
                  </CardDescription>
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(240px,1fr)_180px_150px]">
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-label="Search notifications"
                      className="pl-8"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search notifications…"
                      value={search}
                    />
                  </div>
                  <Select
                    onValueChange={(value) =>
                      setType((value ?? "all") as NotificationType | "all")
                    }
                    value={type}
                  >
                    <SelectTrigger aria-label="Filter notification type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {notificationTypes.map((item) => (
                        <SelectItem key={item.type} value={item.type}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(value) =>
                      setReadFilter((value ?? "all") as "all" | "read" | "unread")
                    }
                    value={readFilter}
                  >
                    <SelectTrigger aria-label="Filter read status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All alerts</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredNotifications.length ? (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markRead}
                      onOpen={openNotification}
                      reading={
                        markReadMutation.isPending &&
                        markReadMutation.variables === notification.id
                      }
                    />
                  ))}
                </div>
              ) : (
                <Empty className="min-h-72">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BellIcon />
                    </EmptyMedia>
                    <EmptyTitle>No matching notifications</EmptyTitle>
                    <EmptyDescription>
                      Try changing the notification type, read status, or search.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}

function NotificationsHeading() {
  return (
    <div>
      <p className="text-sm text-muted-foreground">Vendor alerts</p>
      <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
        Notifications
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Monitor approvals, compliance, performance, delivery and payment events
        requiring attention.
      </p>
    </div>
  )
}

function NotificationsError({
  error,
  onRetry,
}: {
  error: Error
  onRetry: () => void
}) {
  const unauthorized =
    error instanceof ApiError && (error.status === 401 || error.status === 403)

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>
        {unauthorized
          ? "Notification access is restricted"
          : "Notifications are unavailable"}
      </AlertTitle>
      <AlertDescription>
        {unauthorized
          ? "Your account does not have permission to view vendor notifications."
          : error.message}
      </AlertDescription>
      {!unauthorized ? (
        <AlertAction>
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCwIcon />
            Retry
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  )
}

function NotificationsLoading() {
  return (
    <main
      aria-label="Loading notifications"
      aria-live="polite"
      className="flex min-w-0 flex-1 flex-col gap-6 p-4 lg:p-6"
    >
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className="h-28" key={index} />
        ))}
      </div>
      <Skeleton className="h-[620px]" />
    </main>
  )
}
