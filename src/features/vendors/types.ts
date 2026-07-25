export type VendorStatus = "Active" | "Blacklisted" | "Inactive" | "Pending"

export type VendorAddress = {
  city: string
  country: string
  line1: string
  line2?: string
  postalCode: string
  state: string
}

export type VendorContactDetails = {
  designation: string
  email: string
  name: string
  phone: string
}

export type VendorBankDetails = {
  accountName: string
  accountNumber: string
  bankName: string
  ifscCode: string
}

export type VendorPaymentTerms =
  | "Advance"
  | "Due on receipt"
  | "Net 15"
  | "Net 30"
  | "Net 45"
  | "Net 60"

export type VendorUpload = {
  lastModified: number
  name: string
  size: number
  type: "application/pdf" | "image/jpeg" | "image/png"
}

export type Vendor = {
  address: VendorAddress
  bankDetails: VendorBankDetails
  category: string
  certifications: string[]
  city: string
  code: string
  contactPerson: string
  contactDetails: VendorContactDetails
  createdAt: string
  gst: string
  id: string
  lastTransaction: string | null
  name: string
  pan: string
  paymentTerms: VendorPaymentTerms
  rating: number
  status: VendorStatus
  totalPurchase: number
}

export type CreateVendorInput = {
  address: VendorAddress
  bankDetails: VendorBankDetails
  category: string
  certifications: string[]
  contactDetails: VendorContactDetails
  documents: VendorUpload[]
  gst: string
  name: string
  pan: string
  paymentTerms: VendorPaymentTerms
}

export type VendorListResponse = {
  items: Vendor[]
  total: number
}

export type VendorContact = {
  email: string
  id: string
  isPrimary: boolean
  name: string
  phone: string
  role: string
}

export type VendorPerformanceHistoryPoint = {
  deliveryScore: number
  month: string
  qualityScore: number
}

export type VendorPerformance = {
  complianceScore: number
  deliveryScore: number
  history: VendorPerformanceHistoryPoint[]
  qualityScore: number
  responseScore: number
}

export type VendorPurchaseOrder = {
  createdAt: string
  id: string
  orderNumber: string
  status: "Active" | "Completed"
  value: number
}

export type VendorDocument = {
  id: string
  name: string
  status: "Approved" | "Expired" | "Pending Review"
  type: string
  uploadedAt: string
}

export type VendorPayment = {
  amount: number
  dueDate: string
  id: string
  invoiceNumber: string
  paidAt: string | null
  status: "Overdue" | "Paid" | "Pending"
}

export type VendorProject = {
  code: string
  id: string
  name: string
  role: string
  startedAt: string
  status: "Active" | "Completed" | "On Hold"
}

export type VendorIssue = {
  createdAt: string
  id: string
  severity: "Critical" | "High" | "Low" | "Medium"
  status: "In Progress" | "Open" | "Resolved"
  title: string
}

export type VendorAuditEvent = {
  action: string
  actor: string
  createdAt: string
  description: string
  id: string
}

export type VendorProfile = {
  auditTimeline: VendorAuditEvent[]
  contacts: VendorContact[]
  documents: VendorDocument[]
  issues: VendorIssue[]
  payments: VendorPayment[]
  performance: VendorPerformance
  projects: VendorProject[]
}

export type VendorDetailsResponse = VendorProfile & {
  purchaseHistory: VendorPurchaseOrder[]
  vendor: Vendor
}

export type VendorComparisonItem = {
  averageOrderValue: number
  category: string
  certifications: string[]
  city: string
  code: string
  deliveryScore: number
  id: string
  name: string
  orderCount: number
  paymentTerms: VendorPaymentTerms
  rating: number
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  riskScore: number
  status: VendorStatus
  totalPurchaseValue: number
}

export type VendorComparisonResponse = {
  items: VendorComparisonItem[]
  updatedAt: string
}
