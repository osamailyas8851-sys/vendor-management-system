import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowDownToLineIcon,
  ArrowUpDownIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  RotateCcwIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { Vendor, VendorStatus } from "@/features/vendors/types"

const SAVED_VIEWS_KEY = "fieldnerve.vendor-directory.saved-views.v1"
const DEFAULT_PAGE_SIZE = 10

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

const statusVariant: Record<
  VendorStatus,
  "destructive" | "outline" | "secondary"
> = {
  Active: "secondary",
  Blacklisted: "destructive",
  Inactive: "outline",
  Pending: "outline",
}

type SavedVendorView = {
  category: string
  city: string
  columnVisibility: VisibilityState
  id: string
  name: string
  pageSize: number
  search: string
  sorting: SortingState
  status: string
}

const vendorSearchFilter: FilterFn<Vendor> = (row, _columnId, filterValue) => {
  const search = String(filterValue).trim().toLowerCase()

  if (!search) {
    return true
  }

  const vendor = row.original

  return [
    vendor.name,
    vendor.code,
    vendor.category,
    vendor.contactPerson,
    vendor.city,
    vendor.status,
  ].some((value) => value.toLowerCase().includes(search))
}

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "No transactions"
}

function SortableColumnHeader({
  column,
  title,
}: {
  column: Column<Vendor, unknown>
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

const columns: ColumnDef<Vendor>[] = [
  {
    accessorKey: "name",
    enableHiding: false,
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Vendor Name" />
    ),
    cell: ({ row }) => (
      <span className="block min-w-44 font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Vendor Code" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Category" />
    ),
  },
  {
    accessorKey: "contactPerson",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Contact Person" />
    ),
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="City" />
    ),
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) =>
      row.original.rating > 0 ? (
        <span className="inline-flex items-center gap-1 font-medium tabular-nums">
          <StarIcon className="size-3.5 fill-current text-amber-500" />
          {row.original.rating.toFixed(1)}
        </span>
      ) : (
        <span className="text-muted-foreground">Unrated</span>
      ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "lastTransaction",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Last Transaction" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDate(row.original.lastTransaction)}
      </span>
    ),
  },
  {
    accessorKey: "totalPurchase",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Total Purchase Value" />
    ),
    cell: ({ row }) => (
      <span className="block whitespace-nowrap text-right font-medium tabular-nums">
        {currencyFormatter.format(row.original.totalPurchase)}
      </span>
    ),
  },
]

const columnWidths: Record<string, number> = {
  name: 210,
  code: 145,
  category: 130,
  contactPerson: 160,
  city: 105,
  rating: 90,
  status: 115,
  lastTransaction: 145,
  totalPurchase: 185,
}

function readSavedViews(): SavedVendorView[] {
  try {
    const storedViews = window.localStorage.getItem(SAVED_VIEWS_KEY)
    const parsedViews: unknown = storedViews ? JSON.parse(storedViews) : []

    return Array.isArray(parsedViews) ? (parsedViews as SavedVendorView[]) : []
  } catch {
    return []
  }
}

function persistSavedViews(views: SavedVendorView[]) {
  try {
    window.localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views))
  } catch {
    // Saving a view is optional when browser storage is unavailable.
  }
}

function escapeCsvValue(value: string | number) {
  const normalizedValue = String(value)

  return /[",\n]/.test(normalizedValue)
    ? `"${normalizedValue.replace(/"/g, '""')}"`
    : normalizedValue
}

type VendorDirectoryTableProps = {
  data: Vendor[]
}

export function VendorDirectoryTable({ data }: VendorDirectoryTableProps) {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState("all")
  const [city, setCity] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [savedViews, setSavedViews] =
    React.useState<SavedVendorView[]>(readSavedViews)
  const [selectedViewId, setSelectedViewId] = React.useState("default")
  const [viewName, setViewName] = React.useState("")
  const [saveViewOpen, setSaveViewOpen] = React.useState(false)

  const categories = React.useMemo(
    () => [...new Set(data.map((vendor) => vendor.category))].sort(),
    [data]
  )
  const cities = React.useMemo(
    () => [...new Set(data.map((vendor) => vendor.city))].sort(),
    [data]
  )
  const filteredData = React.useMemo(
    () =>
      data.filter(
        (vendor) =>
          (category === "all" || vendor.category === category) &&
          (city === "all" || vendor.city === city) &&
          (status === "all" || vendor.status === status)
      ),
    [category, city, data, status]
  )

  const table = useReactTable({
    columns,
    data: filteredData,
    globalFilterFn: vendorSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setSearch,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnVisibility,
      globalFilter: search,
      pagination,
      sorting,
    },
  })

  const totalResults = table.getFilteredRowModel().rows.length
  const visibleColumns = table.getVisibleLeafColumns()
  const minimumTableWidth = visibleColumns.reduce(
    (width, column) => width + (columnWidths[column.id] ?? 140),
    0
  )
  const hasActiveFilters =
    search.length > 0 || category !== "all" || city !== "all" || status !== "all"

  const resetView = () => {
    setSearch("")
    setCategory("all")
    setCity("all")
    setStatus("all")
    setSorting([])
    setColumnVisibility({})
    setPagination({ pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE })
    setSelectedViewId("default")
  }

  const applySavedView = (viewId: string | null) => {
    if (!viewId) {
      return
    }

    if (viewId === "default") {
      resetView()
      return
    }

    const view = savedViews.find((savedView) => savedView.id === viewId)

    if (!view) {
      return
    }

    setSearch(view.search)
    setCategory(view.category)
    setCity(view.city)
    setStatus(view.status)
    setSorting(view.sorting)
    setColumnVisibility(view.columnVisibility)
    setPagination({ pageIndex: 0, pageSize: view.pageSize })
    setSelectedViewId(view.id)
  }

  const saveCurrentView = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedName = viewName.trim()

    if (!normalizedName) {
      return
    }

    const savedView: SavedVendorView = {
      category,
      city,
      columnVisibility,
      id: globalThis.crypto?.randomUUID?.() ?? `view-${Date.now()}`,
      name: normalizedName,
      pageSize: pagination.pageSize,
      search,
      sorting,
      status,
    }
    const nextViews = [...savedViews, savedView]

    setSavedViews(nextViews)
    persistSavedViews(nextViews)
    setSelectedViewId(savedView.id)
    setViewName("")
    setSaveViewOpen(false)
  }

  const deleteSelectedView = () => {
    if (selectedViewId === "default") {
      return
    }

    const nextViews = savedViews.filter((view) => view.id !== selectedViewId)

    setSavedViews(nextViews)
    persistSavedViews(nextViews)
    resetView()
  }

  const exportCsv = () => {
    const exportableColumns = [
      { id: "name", label: "Vendor Name", value: (vendor: Vendor) => vendor.name },
      { id: "code", label: "Vendor Code", value: (vendor: Vendor) => vendor.code },
      { id: "category", label: "Category", value: (vendor: Vendor) => vendor.category },
      {
        id: "contactPerson",
        label: "Contact Person",
        value: (vendor: Vendor) => vendor.contactPerson,
      },
      { id: "city", label: "City", value: (vendor: Vendor) => vendor.city },
      { id: "rating", label: "Rating", value: (vendor: Vendor) => vendor.rating },
      { id: "status", label: "Status", value: (vendor: Vendor) => vendor.status },
      {
        id: "lastTransaction",
        label: "Last Transaction",
        value: (vendor: Vendor) => vendor.lastTransaction ?? "",
      },
      {
        id: "totalPurchase",
        label: "Total Purchase Value",
        value: (vendor: Vendor) => vendor.totalPurchase,
      },
    ].filter((exportColumn) => table.getColumn(exportColumn.id)?.getIsVisible())
    const exportRows = table.getPrePaginationRowModel().rows
    const csv = [
      exportableColumns.map((column) => escapeCsvValue(column.label)).join(","),
      ...exportRows.map((row) =>
        exportableColumns
          .map((column) => escapeCsvValue(column.value(row.original)))
          .join(",")
      ),
    ].join("\n")
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    })
    const downloadUrl = URL.createObjectURL(blob)
    const downloadLink = document.createElement("a")

    downloadLink.href = downloadUrl
    downloadLink.download = `fieldnerve-vendors-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <Card className="min-w-0 max-w-full overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Vendor directory</CardTitle>
            <CardDescription>
              {totalResults.toLocaleString("en-IN")} of{" "}
              {data.length.toLocaleString("en-IN")} vendors
            </CardDescription>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Select value={selectedViewId} onValueChange={applySavedView}>
              <SelectTrigger aria-label="Select saved view" className="min-w-40">
                <BookmarkIcon />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="default">Default view</SelectItem>
                {savedViews.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={saveViewOpen} onOpenChange={setSaveViewOpen}>
              <DialogTrigger render={<Button variant="outline" />}>
                <BookmarkIcon />
                Save view
              </DialogTrigger>
              <DialogContent>
                <form className="grid gap-4" onSubmit={saveCurrentView}>
                  <DialogHeader>
                    <DialogTitle>Save current view</DialogTitle>
                    <DialogDescription>
                      Save the current filters, sorting, page size and visible columns.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <Label htmlFor="saved-view-name">View name</Label>
                    <Input
                      autoFocus
                      id="saved-view-name"
                      maxLength={60}
                      onChange={(event) => setViewName(event.target.value)}
                      placeholder="e.g. Active Mumbai vendors"
                      value={viewName}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>
                      Cancel
                    </DialogClose>
                    <Button disabled={!viewName.trim()} type="submit">
                      Save view
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              aria-label="Delete selected saved view"
              disabled={selectedViewId === "default"}
              onClick={deleteSelectedView}
              size="icon"
              title="Delete selected view"
              variant="outline"
            >
              <Trash2Icon />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                <Columns3Icon />
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        checked={column.getIsVisible()}
                        key={column.id}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(Boolean(checked))
                        }
                      >
                        {
                          {
                            code: "Vendor Code",
                            category: "Category",
                            contactPerson: "Contact Person",
                            city: "City",
                            rating: "Rating",
                            status: "Status",
                            lastTransaction: "Last Transaction",
                            totalPurchase: "Total Purchase Value",
                          }[column.id]
                        }
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              disabled={totalResults === 0}
              onClick={exportCsv}
              variant="outline"
            >
              <ArrowDownToLineIcon />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-w-0 p-0">
        <div className="grid gap-3 border-b p-4 lg:grid-cols-[minmax(260px,1fr)_repeat(3,minmax(150px,auto))_auto]">
          <div className="grid gap-1.5">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="vendor-search"
            >
              Search vendors
            </Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                id="vendor-search"
                onChange={(event) => {
                  setSearch(event.target.value)
                  table.setPageIndex(0)
                }}
                placeholder="Name, code, contact or city…"
                value={search}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="vendor-category-filter"
            >
              Category
            </Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value ?? "all")
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger className="w-full" id="vendor-category-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="vendor-status-filter"
            >
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value ?? "all")
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger className="w-full" id="vendor-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="vendor-city-filter"
            >
              City
            </Label>
            <Select
              value={city}
              onValueChange={(value) => {
                setCity(value ?? "all")
                table.setPageIndex(0)
              }}
            >
              <SelectTrigger className="w-full" id="vendor-city-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="self-end"
            disabled={!hasActiveFilters}
            onClick={resetView}
            variant="ghost"
          >
            <RotateCcwIcon />
            Reset
          </Button>
        </div>

        <Table
          className="table-fixed"
          containerClassName="hidden max-h-[620px] overflow-auto md:block"
          style={{ minWidth: `${minimumTableWidth}px` }}
        >
            <colgroup>
              {visibleColumns.map((column) => (
                <col
                  key={column.id}
                  style={{ width: `${columnWidths[column.id] ?? 140}px` }}
                />
              ))}
            </colgroup>
            <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className={
                        header.column.id === "totalPurchase" ? "text-right" : ""
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    aria-label={`Open ${row.original.name}`}
                    className="cursor-pointer"
                    key={row.id}
                    onClick={() =>
                      void navigate({
                        to: "/vendors/$vendorId",
                        params: { vendorId: row.original.id },
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        void navigate({
                          to: "/vendors/$vendorId",
                          params: { vendorId: row.original.id },
                        })
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-40 text-center text-muted-foreground"
                    colSpan={table.getVisibleLeafColumns().length}
                  >
                    No vendors match the current search and filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
        </Table>

        <div className="grid gap-3 p-3 md:hidden">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(({ original: vendor }) => (
              <article
                aria-label={`Open ${vendor.name}`}
                className="grid cursor-pointer gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                key={vendor.id}
                onClick={() =>
                  void navigate({
                    to: "/vendors/$vendorId",
                    params: { vendorId: vendor.id },
                  })
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    void navigate({
                      to: "/vendors/$vendorId",
                      params: { vendorId: vendor.id },
                    })
                  }
                }}
                role="link"
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{vendor.name}</h3>
                    <p className="font-mono text-xs text-muted-foreground">
                      {vendor.code}
                    </p>
                  </div>
                  <Badge variant={statusVariant[vendor.status]}>
                    {vendor.status}
                  </Badge>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Category</dt>
                    <dd className="mt-0.5">{vendor.category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">City</dt>
                    <dd className="mt-0.5">{vendor.city}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Contact</dt>
                    <dd className="mt-0.5">{vendor.contactPerson}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Rating</dt>
                    <dd className="mt-0.5">
                      {vendor.rating > 0 ? vendor.rating.toFixed(1) : "Unrated"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Last transaction</dt>
                    <dd className="mt-0.5">{formatDate(vendor.lastTransaction)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Purchase value</dt>
                    <dd className="mt-0.5 font-medium">
                      {currencyFormatter.format(vendor.totalPurchase)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No vendors match the current search and filters.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {totalResults === 0
              ? 0
              : pagination.pageIndex * pagination.pageSize + 1}
            –{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalResults)} of{" "}
            {totalResults.toLocaleString("en-IN")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) =>
                table.setPageSize(Number(value ?? DEFAULT_PAGE_SIZE))
              }
            >
              <SelectTrigger aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {[10, 20, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="px-1 text-sm tabular-nums">
              Page {pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
            </span>
            <Button
              aria-label="First page"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.firstPage()}
              size="icon"
              variant="outline"
            >
              <ChevronsLeftIcon />
            </Button>
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
            <Button
              aria-label="Last page"
              disabled={!table.getCanNextPage()}
              onClick={() => table.lastPage()}
              size="icon"
              variant="outline"
            >
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
