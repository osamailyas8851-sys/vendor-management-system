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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WalletCardsIcon } from "lucide-react"
import type {
  PaymentHistorySummary,
} from "@/features/performance/types"
import type { VendorPayment } from "@/features/vendors/types"

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
})

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Not paid"
}

export function PerformancePaymentHistory({
  payments,
  summary,
}: {
  payments: VendorPayment[]
  summary: PaymentHistorySummary
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              Invoice settlement performance and outstanding exposure
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{summary.paid} paid</Badge>
            <Badge variant="outline">{summary.pending} pending</Badge>
            {summary.overdue > 0 ? (
              <Badge variant="destructive">{summary.overdue} overdue</Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {payments.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.invoiceNumber}
                      </TableCell>
                      <TableCell>{formatDate(payment.dueDate)}</TableCell>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "Overdue"
                              ? "destructive"
                              : payment.status === "Paid"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {currencyFormatter.format(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y md:hidden">
              {payments.map((payment) => (
                <div className="grid gap-3 p-4" key={payment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs">
                      {payment.invoiceNumber}
                    </span>
                    <Badge
                      variant={
                        payment.status === "Overdue"
                          ? "destructive"
                          : payment.status === "Paid"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Due date</p>
                      <p>{formatDate(payment.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        {currencyFormatter.format(payment.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4 text-sm text-muted-foreground">
              Total invoice value: {currencyFormatter.format(summary.totalValue)}
            </div>
          </>
        ) : (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WalletCardsIcon />
              </EmptyMedia>
              <EmptyTitle>No payment history</EmptyTitle>
              <EmptyDescription>
                Payment records will appear after invoices are raised.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
