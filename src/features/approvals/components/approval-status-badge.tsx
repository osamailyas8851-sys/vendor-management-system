import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ApprovalStatus } from "@/features/approvals/types"

const statusClasses: Record<ApprovalStatus, string> = {
  Approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  "On Hold":
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  Pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  Rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
}

export function ApprovalStatusBadge({
  className,
  status,
}: {
  className?: string
  status: ApprovalStatus
}) {
  return (
    <Badge className={cn("gap-1.5", statusClasses[status], className)} variant="outline">
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  )
}
