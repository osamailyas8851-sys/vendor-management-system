import { AlertTriangleIcon, CircleCheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import type { VendorIssue } from "@/features/vendors/types"

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function PerformanceRecentIssues({ issues }: { issues: VendorIssue[] }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Recent Issues</CardTitle>
        <CardDescription>
          Latest operational and compliance concerns
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {issues.length ? (
          issues.map((issue) => (
            <article className="rounded-lg border p-4" key={issue.id}>
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <AlertTriangleIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{issue.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Raised {dateFormatter.format(new Date(issue.createdAt))}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          issue.severity === "Critical" || issue.severity === "High"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {issue.severity}
                      </Badge>
                      <Badge
                        variant={issue.status === "Resolved" ? "secondary" : "outline"}
                      >
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleCheckIcon />
              </EmptyMedia>
              <EmptyTitle>No recent issues</EmptyTitle>
              <EmptyDescription>
                This vendor has no open or historical performance issues.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
