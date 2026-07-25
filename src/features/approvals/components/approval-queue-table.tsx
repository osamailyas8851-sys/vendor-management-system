import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon,
  SearchIcon,
} from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApprovalStatusBadge } from "@/features/approvals/components/approval-status-badge"
import type {
  ApprovalListItem,
  ApprovalStatus,
} from "@/features/approvals/types"

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function SortableHeader({
  column,
  title,
}: {
  column: Column<ApprovalListItem, unknown>
  title: string
}) {
  return (
    <Button
      className="-ml-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      size="sm"
      variant="ghost"
    >
      {title}
      <ArrowUpDownIcon />
    </Button>
  )
}

const columns: ColumnDef<ApprovalListItem>[] = [
  {
    accessorKey: "vendorName",
    header: ({ column }) => (
      <SortableHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => (
      <div className="min-w-48">
        <p className="font-medium">{row.original.vendorName}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column} title="Approval Status" />
    ),
    cell: ({ row }) => <ApprovalStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <SortableHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <div>
        <p>{row.original.category}</p>
        <p className="text-xs text-muted-foreground">{row.original.city}</p>
      </div>
    ),
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Submitted" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="whitespace-nowrap">
          {dateFormatter.format(new Date(row.original.submittedAt))}
        </p>
        <p className="text-xs text-muted-foreground">
          by {row.original.submittedBy}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "assignedReviewer",
    header: ({ column }) => (
      <SortableHeader column={column} title="Assigned Reviewer" />
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {dateFormatter.format(new Date(row.original.updatedAt))}
      </span>
    ),
  },
]

export function ApprovalQueueTable({ data }: { data: ApprovalListItem[] }) {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<ApprovalStatus | "all">("all")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const filteredData = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return data.filter((item) => {
      const matchesStatus = status === "all" || item.status === status
      const matchesSearch =
        !normalizedSearch ||
        [
          item.vendorName,
          item.code,
          item.category,
          item.city,
          item.assignedReviewer,
        ].some((value) => value.toLowerCase().includes(normalizedSearch))

      return matchesStatus && matchesSearch
    })
  }, [data, search, status])
  const table = useReactTable({
    columns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { pagination, sorting },
  })
  const rows = table.getRowModel().rows
  const firstResult = filteredData.length
    ? pagination.pageIndex * pagination.pageSize + 1
    : 0
  const lastResult = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    filteredData.length
  )

  const openApproval = (vendorId: string) => {
    void navigate({
      to: "/approvals/$vendorId",
      params: { vendorId },
    })
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Vendor approval queue</CardTitle>
            <CardDescription>
              {filteredData.length.toLocaleString("en-IN")} of{" "}
              {data.length.toLocaleString("en-IN")} requests
            </CardDescription>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(260px,1fr)_180px]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search approval requests"
                className="pl-8"
                onChange={(event) => {
                  setSearch(event.target.value)
                  table.setPageIndex(0)
                }}
                placeholder="Search vendor, code or reviewer…"
                value={search}
              />
            </div>
            <Select
              onValueChange={(value) => {
                setStatus((value ?? "all") as ApprovalStatus | "all")
                table.setPageIndex(0)
              }}
              value={status}
            >
              <SelectTrigger aria-label="Filter approval status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {rows.length === 0 ? (
          <Empty className="min-h-80">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No approval requests found</EmptyTitle>
              <EmptyDescription>
                Try changing the search or approval status filter.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
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
                  {rows.map((row) => (
                    <TableRow
                      className="cursor-pointer"
                      key={row.id}
                      onClick={() => openApproval(row.original.vendorId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          openApproval(row.original.vendorId)
                        }
                      }}
                      tabIndex={0}
                    >
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

            <div className="divide-y md:hidden">
              {rows.map((row) => (
                <button
                  className="grid w-full gap-3 p-4 text-left hover:bg-muted/50"
                  key={row.id}
                  onClick={() => openApproval(row.original.vendorId)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {row.original.vendorName}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {row.original.code}
                      </p>
                    </div>
                    <ApprovalStatusBadge status={row.original.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p>{row.original.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p>{dateFormatter.format(new Date(row.original.submittedAt))}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {firstResult}–{lastResult} of {filteredData.length}
          </p>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Select
              onValueChange={(value) => table.setPageSize(Number(value ?? 10))}
              value={String(pagination.pageSize)}
            >
              <SelectTrigger aria-label="Rows per page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="whitespace-nowrap text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)}
            </span>
            <Button
              aria-label="Previous page"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="icon"
              variant="outline"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              aria-label="Next page"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="icon"
              variant="outline"
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
