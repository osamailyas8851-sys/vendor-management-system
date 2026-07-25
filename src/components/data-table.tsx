import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDownIcon, StarIcon } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { RecentVendor } from "@/features/dashboard/types"
import type { VendorStatus } from "@/features/vendors/types"

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency",
})

const statusVariant: Record<
  VendorStatus,
  "destructive" | "outline" | "secondary"
> = {
  Active: "secondary",
  Blacklisted: "destructive",
  Inactive: "outline",
  Pending: "outline",
}

const columns: ColumnDef<RecentVendor>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        className="-ml-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        size="sm"
        variant="ghost"
      >
        Vendor
        <ArrowUpDownIcon />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="min-w-48">
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.code}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <Button
        className="-ml-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        size="sm"
        variant="ghost"
      >
        Rating
        <ArrowUpDownIcon />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 font-medium tabular-nums">
        <StarIcon className="size-3.5 fill-current text-amber-500" />
        {row.original.rating.toFixed(1)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "totalPurchase",
    header: ({ column }) => (
      <Button
        className="-ml-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        size="sm"
        variant="ghost"
      >
        Purchase value
        <ArrowUpDownIcon />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {currencyFormatter.format(row.original.totalPurchase)}
      </div>
    ),
  },
]

type DataTableProps = {
  data: RecentVendor[]
}

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader>
        <CardTitle>Recently onboarded vendors</CardTitle>
        <CardDescription>
          Latest additions and their current approval status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <StarIcon />
              </EmptyMedia>
              <EmptyTitle>No recent vendors</EmptyTitle>
              <EmptyDescription>
                Newly onboarded vendors will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        className={
                          header.column.id === "totalPurchase"
                            ? "text-right"
                            : ""
                        }
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
