import {
  CheckIcon,
  MessageSquareIcon,
  PauseIcon,
  SendIcon,
  XIcon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  ApprovalAction,
  ApprovalTimelineEvent,
} from "@/features/approvals/types"

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  year: "numeric",
})

const actionIcons: Record<ApprovalAction, typeof CheckIcon> = {
  Approved: CheckIcon,
  "Changes Requested": PauseIcon,
  "Comment Added": MessageSquareIcon,
  Rejected: XIcon,
  Submitted: SendIcon,
}

export function ApprovalTimeline({
  timeline,
}: {
  timeline: ApprovalTimelineEvent[]
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Approval Timeline</CardTitle>
        <CardDescription>
          Complete chronological record of this workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid">
          {timeline.map((event, index) => {
            const Icon = actionIcons[event.action]

            return (
              <li className="relative grid grid-cols-[2rem_1fr] gap-3 pb-6 last:pb-0" key={event.id}>
                {index < timeline.length - 1 ? (
                  <span className="absolute top-8 bottom-0 left-[0.95rem] w-px bg-border" />
                ) : null}
                <span className="relative z-10 flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground">
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 pt-1">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div>
                      <p className="font-medium">{event.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.actor} · {event.actorRole}
                      </p>
                    </div>
                    <time className="whitespace-nowrap text-xs text-muted-foreground">
                      {dateTimeFormatter.format(new Date(event.createdAt))}
                    </time>
                  </div>
                  {event.fromStatus && event.fromStatus !== event.toStatus ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {event.fromStatus} → {event.toStatus}
                    </p>
                  ) : null}
                  {event.comment ? (
                    <p className="mt-2 rounded-lg bg-muted/60 p-3 text-sm">
                      {event.comment}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
