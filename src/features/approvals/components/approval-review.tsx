import { Link } from "@tanstack/react-router"
import {
  Building2Icon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ContactRoundIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LandmarkIcon,
  MapPinIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react"

import {
  Alert,
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
import { ApprovalActionDialog } from "@/features/approvals/components/approval-action-dialog"
import { ApprovalComments } from "@/features/approvals/components/approval-comments"
import { ApprovalStatusBadge } from "@/features/approvals/components/approval-status-badge"
import { ApprovalTimeline } from "@/features/approvals/components/approval-timeline"
import type {
  ApprovalDetailsResponse,
  ApprovalStatus,
} from "@/features/approvals/types"

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const statusDescriptions: Record<ApprovalStatus, string> = {
  Approved: "This vendor has completed review and is active for purchasing.",
  "On Hold": "Changes are required before this submission can be approved.",
  Pending: "This vendor is awaiting a procurement decision.",
  Rejected: "This submission has received a final rejection decision.",
}

function InfoItem({
  children,
  className,
  label,
}: {
  children: React.ReactNode
  className?: string
  label: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium">{children}</dd>
    </div>
  )
}

function SectionHeading({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
}) {
  return (
    <CardHeader className="border-b">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}

export function ApprovalReview({ data }: { data: ApprovalDetailsResponse }) {
  const { approval, documents, vendor } = data
  const isFinal =
    approval.status === "Approved" || approval.status === "Rejected"
  const formattedAddress = [
    vendor.address.line1,
    vendor.address.line2,
    vendor.address.city,
    vendor.address.state,
    vendor.address.postalCode,
    vendor.address.country,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="grid gap-6">
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 gap-5">
          <Card>
            <SectionHeading
              description="Legal identity, classification and registered address"
              icon={Building2Icon}
              title="Business Information"
            />
            <CardContent>
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Vendor Name">{vendor.name}</InfoItem>
                <InfoItem label="Vendor Code">
                  <span className="font-mono">{vendor.code}</span>
                </InfoItem>
                <InfoItem label="Category">{vendor.category}</InfoItem>
                <InfoItem label="GST">{vendor.gst}</InfoItem>
                <InfoItem label="PAN">{vendor.pan}</InfoItem>
                <InfoItem label="Payment Terms">{vendor.paymentTerms}</InfoItem>
                <InfoItem className="sm:col-span-2 lg:col-span-3" label="Address">
                  <span className="inline-flex items-start gap-2 font-normal">
                    <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {formattedAddress}
                  </span>
                </InfoItem>
                <InfoItem className="sm:col-span-2 lg:col-span-3" label="Certifications">
                  <span className="flex flex-wrap gap-2">
                    {vendor.certifications.map((certification) => (
                      <Badge key={certification} variant="secondary">
                        <ShieldCheckIcon />
                        {certification}
                      </Badge>
                    ))}
                  </span>
                </InfoItem>
              </dl>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <SectionHeading
                description="Primary vendor representative"
                icon={ContactRoundIcon}
                title="Contact Details"
              />
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                  <InfoItem label="Contact Person">
                    {vendor.contactDetails.name}
                  </InfoItem>
                  <InfoItem label="Designation">
                    {vendor.contactDetails.designation}
                  </InfoItem>
                  <InfoItem label="Email">
                    <a className="break-all hover:underline" href={`mailto:${vendor.contactDetails.email}`}>
                      {vendor.contactDetails.email}
                    </a>
                  </InfoItem>
                  <InfoItem label="Phone">
                    +91 {vendor.contactDetails.phone}
                  </InfoItem>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <SectionHeading
                description="Payment account submitted for verification"
                icon={LandmarkIcon}
                title="Bank Details"
              />
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                  <InfoItem label="Account Holder">
                    {vendor.bankDetails.accountName}
                  </InfoItem>
                  <InfoItem label="Bank Name">
                    {vendor.bankDetails.bankName}
                  </InfoItem>
                  <InfoItem label="Account Number">
                    •••• {vendor.bankDetails.accountNumber.slice(-4)}
                  </InfoItem>
                  <InfoItem label="IFSC Code">
                    {vendor.bankDetails.ifscCode}
                  </InfoItem>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card>
            <SectionHeading
              description="Files submitted for onboarding verification"
              icon={FileTextIcon}
              title="Documents"
            />
            <CardContent className="grid gap-3">
              {documents.length ? (
                documents.map((document) => (
                  <div
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                    key={document.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <FileTextIcon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{document.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {document.type} · Uploaded{" "}
                          {dateFormatter.format(new Date(document.uploadedAt))}
                        </p>
                      </div>
                    </div>
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
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                  No supporting documents were submitted.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0">
          <Card className="xl:sticky xl:top-[calc(var(--header-height)+1.5rem)]">
            <CardHeader className="border-b">
              <CardTitle>Review Decision</CardTitle>
              <CardDescription>
                Complete the current approval request
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div>
                <p className="text-xs text-muted-foreground">Current status</p>
                <ApprovalStatusBadge className="mt-2" status={approval.status} />
                <p className="mt-3 text-sm text-muted-foreground">
                  {statusDescriptions[approval.status]}
                </p>
              </div>

              <dl className="grid gap-4 border-y py-4">
                <InfoItem label="Submitted by">{approval.submittedBy}</InfoItem>
                <InfoItem label="Submitted on">
                  {dateFormatter.format(new Date(approval.submittedAt))}
                </InfoItem>
                <InfoItem label="Assigned reviewer">
                  {approval.assignedReviewer}
                </InfoItem>
              </dl>

              {isFinal ? (
                <Alert>
                  {approval.status === "Approved" ? (
                    <CheckCircle2Icon />
                  ) : (
                    <XCircleIcon />
                  )}
                  <AlertTitle>Decision completed</AlertTitle>
                  <AlertDescription>
                    This submission has a final {approval.status.toLowerCase()} decision.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-2">
                  <ApprovalActionDialog
                    action="approve"
                    vendorId={vendor.id}
                    vendorName={vendor.name}
                  />
                  <ApprovalActionDialog
                    action="reject"
                    vendorId={vendor.id}
                    vendorName={vendor.name}
                  />
                  {approval.status !== "On Hold" ? (
                    <ApprovalActionDialog
                      action="request_changes"
                      vendorId={vendor.id}
                      vendorName={vendor.name}
                    />
                  ) : null}
                </div>
              )}

              <Button
                render={
                  <Link
                    params={{ vendorId: vendor.id }}
                    to="/vendors/$vendorId"
                  />
                }
                variant="outline"
              >
                <ExternalLinkIcon />
                Open Vendor Details
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClockIcon className="size-3.5" />
                Last updated {dateFormatter.format(new Date(approval.updatedAt))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <ApprovalComments
          comments={approval.comments}
          vendorId={vendor.id}
        />
        <ApprovalTimeline timeline={approval.timeline} />
      </div>
    </div>
  )
}
