import type {
  VendorIssue,
  VendorPayment,
  VendorStatus,
} from "@/features/vendors/types"

export type VendorRiskLevel = "Low" | "Medium" | "High" | "Critical"

export type PerformanceVendorOption = {
  category: string
  code: string
  id: string
  name: string
  riskLevel: VendorRiskLevel
  riskScore: number
  status: VendorStatus
}

export type PerformanceIndexResponse = {
  items: PerformanceVendorOption[]
  total: number
}

export type PerformanceTrendPoint = {
  deliveryScore: number
  month: string
  qualityScore: number
  riskScore: number
}

export type VendorPerformanceMetrics = {
  deliveryScore: number
  qualityScore: number
  rating: number
  responseTimeHours: number
  riskLevel: VendorRiskLevel
  riskScore: number
}

export type PaymentHistorySummary = {
  overdue: number
  paid: number
  pending: number
  totalValue: number
}

export type VendorPerformanceResponse = {
  metrics: VendorPerformanceMetrics
  paymentHistory: VendorPayment[]
  paymentSummary: PaymentHistorySummary
  recentIssues: VendorIssue[]
  trend: PerformanceTrendPoint[]
  updatedAt: string
  vendor: {
    category: string
    city: string
    code: string
    id: string
    name: string
    status: VendorStatus
  }
}
