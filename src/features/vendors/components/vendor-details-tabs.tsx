import {
  ActivityIcon,
  AlertTriangleIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarClockIcon,
  CircleDollarSignIcon,
  Clock3Icon,
  ContactRoundIcon,
  FileTextIcon,
  FolderKanbanIcon,
  HistoryIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ReceiptTextIcon,
  StarIcon,
  UserRoundIcon,
  WalletCardsIcon,
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  VendorDetailsResponse,
  VendorStatus,
} from "@/features/vendors/types"

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

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  year: "numeric",
})

const performanceChartConfig = {
  qualityScore: {
    label: "Quality score",
    color: "var(--chart-1)",
  },
  deliveryScore: {
    label: "Delivery score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const vendorStatusVariant: Record<
  VendorStatus,
  "destructive" | "outline" | "secondary"
> = {
  Active: "secondary",
  Blacklisted: "destructive",
  Inactive: "outline",
  Pending: "outline",
}

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Not available"
}

const activeTabClassName =
  "h-8 flex-none px-2 after:bg-primary group-data-horizontal/tabs:after:bottom-0 group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-primary"

function TabEmpty({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
}) {
  return (
    <Empty className="min-h-64 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function PerformanceMetric({ label, score }: { label: string; score: number }) {
  return (
    <Card>
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="font-heading text-xl font-medium tabular-nums">
            {score}%
          </span>
        </div>
        <div
          aria-label={`${label}: ${score}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={score}
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

type VendorDetailsTabsProps = {
  data: VendorDetailsResponse
  initialTab?: VendorDetailsTab
}

export type VendorDetailsTab =
  | "overview"
  | "contacts"
  | "performance"
  | "purchases"
  | "documents"
  | "payments"
  | "projects"
  | "issues"
  | "audit"

export function VendorDetailsTabs({ data, initialTab }: VendorDetailsTabsProps) {
  const { vendor } = data
  const activeProjects = data.projects.filter(
    (project) => project.status === "Active"
  ).length
  const openIssues = data.issues.filter(
    (issue) => issue.status !== "Resolved"
  ).length

  return (
    <Tabs defaultValue={initialTab ?? "overview"}>
      <div className="overflow-x-auto overflow-y-hidden border-b">
        <TabsList
          className="h-10 w-max min-w-full flex-nowrap justify-start gap-1 rounded-none p-1"
          variant="line"
        >
          <TabsTrigger className={activeTabClassName} value="overview">
            <Building2Icon /> Overview
          </TabsTrigger>
          <TabsTrigger className={activeTabClassName} value="contacts">
            <ContactRoundIcon /> Contacts
          </TabsTrigger>
          <TabsTrigger className={activeTabClassName} value="performance">
            <ActivityIcon /> Performance
          </TabsTrigger>
          <TabsTrigger className={activeTabClassName} value="purchases">
            <ReceiptTextIcon /> Purchase History
          </TabsTrigger>
          <TabsTrigger className={activeTabClassName} value="documents">
            <FileTextIcon /> Documents
          </TabsTrigger>
          <TabsTrigger className={activeTabClassName} value="payments">
            <WalletCardsIcon /> Payments
          </TabsTrigger>
          <TabsTrigger className={activeTabClassName} value="projects">
            <FolderKanbanIcon /> Projects Associated
          </TabsTrigger>
          <TabsTrigger className={activeTabClassName} value="issues">
            <AlertTriangleIcon /> Issues Raised
          </TabsTrigger>
          <TabsTrigger className={activeTabClassName} value="audit">
            <HistoryIcon /> Audit Timeline
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent className="pt-4" value="overview">
        <div className="grid gap-4">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vendor rating</p>
                  <p className="mt-1 font-heading text-2xl font-medium">
                    {vendor.rating > 0 ? vendor.rating.toFixed(1) : "Unrated"}
                  </p>
                </div>
                <StarIcon className="size-5 fill-current text-amber-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total purchase</p>
                  <p className="mt-1 font-heading text-2xl font-medium">
                    {currencyFormatter.format(vendor.totalPurchase)}
                  </p>
                </div>
                <CircleDollarSignIcon className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active projects</p>
                  <p className="mt-1 font-heading text-2xl font-medium">
                    {activeProjects}
                  </p>
                </div>
                <BriefcaseBusinessIcon className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Open issues</p>
                  <p className="mt-1 font-heading text-2xl font-medium">
                    {openIssues}
                  </p>
                </div>
                <AlertTriangleIcon className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Vendor information</CardTitle>
              <CardDescription>
                Core registration and relationship details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Vendor code</dt>
                  <dd className="mt-1 font-mono text-sm">{vendor.code}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Category</dt>
                  <dd className="mt-1 text-sm">{vendor.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge variant={vendorStatusVariant[vendor.status]}>
                      {vendor.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Primary contact</dt>
                  <dd className="mt-1 text-sm">{vendor.contactPerson}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">City</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 text-sm">
                    <MapPinIcon className="size-3.5 text-muted-foreground" />
                    {vendor.city}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Onboarded</dt>
                  <dd className="mt-1 text-sm">{formatDate(vendor.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Last transaction</dt>
                  <dd className="mt-1 text-sm">
                    {formatDate(vendor.lastTransaction)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent className="pt-4" value="contacts">
        {data.contacts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.contacts.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{contact.name}</CardTitle>
                      <CardDescription>{contact.role}</CardDescription>
                    </div>
                    {contact.isPrimary ? <Badge>Primary</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <a
                    className="inline-flex items-center gap-2 text-sm hover:text-primary"
                    href={`mailto:${contact.email}`}
                  >
                    <MailIcon className="size-4 text-muted-foreground" />
                    {contact.email}
                  </a>
                  <a
                    className="inline-flex items-center gap-2 text-sm hover:text-primary"
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  >
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    {contact.phone}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <TabEmpty
            description="Contact records will appear when they are added."
            icon={UserRoundIcon}
            title="No contacts available"
          />
        )}
      </TabsContent>

      <TabsContent className="pt-4" value="performance">
        <div className="grid gap-4">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PerformanceMetric
              label="Quality"
              score={data.performance.qualityScore}
            />
            <PerformanceMetric
              label="On-time delivery"
              score={data.performance.deliveryScore}
            />
            <PerformanceMetric
              label="Compliance"
              score={data.performance.complianceScore}
            />
            <PerformanceMetric
              label="Response"
              score={data.performance.responseScore}
            />
          </section>
          <Card>
            <CardHeader>
              <CardTitle>Performance trend</CardTitle>
              <CardDescription>
                Quality and delivery performance over the last six months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                aria-label="Line chart showing vendor quality and delivery scores"
                className="h-[300px] w-full"
                config={performanceChartConfig}
                role="img"
              >
                <LineChart
                  accessibilityLayer
                  data={data.performance.history}
                  margin={{ left: -12, right: 12, top: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="month"
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    axisLine={false}
                    domain={[50, 100]}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="line" />}
                    cursor={false}
                  />
                  <Line
                    dataKey="qualityScore"
                    dot={false}
                    stroke="var(--color-qualityScore)"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <Line
                    dataKey="deliveryScore"
                    dot={false}
                    stroke="var(--color-deliveryScore)"
                    strokeWidth={2}
                    type="monotone"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent className="pt-4" value="purchases">
        {data.purchaseHistory.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Purchase orders</CardTitle>
              <CardDescription>
                Purchase order activity associated with this vendor
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purchase Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.purchaseHistory.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "Active" ? "secondary" : "outline"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {currencyFormatter.format(order.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <TabEmpty
            description="Purchase orders will appear after the first transaction."
            icon={ReceiptTextIcon}
            title="No purchase history"
          />
        )}
      </TabsContent>

      <TabsContent className="pt-4" value="documents">
        {data.documents.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Vendor documents</CardTitle>
              <CardDescription>
                Registration, banking and compliance records
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="min-w-64 font-medium">
                        <span className="inline-flex items-center gap-2">
                          <FileTextIcon className="size-4 text-muted-foreground" />
                          {document.name}
                        </span>
                      </TableCell>
                      <TableCell>{document.type}</TableCell>
                      <TableCell>{formatDate(document.uploadedAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            document.status === "Expired"
                              ? "destructive"
                              : document.status === "Approved"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {document.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <TabEmpty
            description="Uploaded vendor documents will appear here."
            icon={FileTextIcon}
            title="No documents"
          />
        )}
      </TabsContent>

      <TabsContent className="pt-4" value="payments">
        {data.payments.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
              <CardDescription>
                Invoice payments, due dates and settlement status
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
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
                  {data.payments.map((payment) => (
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
                      <TableCell className="text-right font-medium">
                        {currencyFormatter.format(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <TabEmpty
            description="Payment records will appear after invoices are raised."
            icon={WalletCardsIcon}
            title="No payments"
          />
        )}
      </TabsContent>

      <TabsContent className="pt-4" value="projects">
        {data.projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.code}</CardDescription>
                    </div>
                    <Badge
                      variant={project.status === "Active" ? "secondary" : "outline"}
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <BriefcaseBusinessIcon className="size-4 text-muted-foreground" />
                    {project.role}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClockIcon className="size-4" />
                    Started {formatDate(project.startedAt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <TabEmpty
            description="Associated projects will appear when the vendor is assigned."
            icon={FolderKanbanIcon}
            title="No associated projects"
          />
        )}
      </TabsContent>

      <TabsContent className="pt-4" value="issues">
        {data.issues.length > 0 ? (
          <div className="grid gap-3">
            {data.issues.map((issue) => (
              <Card key={issue.id}>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{issue.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Raised {formatDate(issue.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        issue.severity === "Critical" || issue.severity === "High"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {issue.severity}
                    </Badge>
                    <Badge variant="secondary">{issue.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <TabEmpty
            description="This vendor has no open or historical issues."
            icon={AlertTriangleIcon}
            title="No issues raised"
          />
        )}
      </TabsContent>

      <TabsContent className="pt-4" value="audit">
        {data.auditTimeline.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Audit timeline</CardTitle>
              <CardDescription>
                Chronological record of important vendor changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative ml-2 border-l">
                {data.auditTimeline.map((event) => (
                  <li className="relative pb-7 pl-6 last:pb-0" key={event.id}>
                    <span className="absolute top-0 -left-2 flex size-4 items-center justify-center rounded-full border bg-background">
                      <Clock3Icon className="size-2.5 text-muted-foreground" />
                    </span>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">{event.action}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          By {event.actor}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-muted-foreground">
                        {dateTimeFormatter.format(new Date(event.createdAt))}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ) : (
          <TabEmpty
            description="Vendor changes and actions will appear here."
            icon={HistoryIcon}
            title="No audit events"
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
