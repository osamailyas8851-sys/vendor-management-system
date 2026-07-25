import type { Vendor } from "@/features/vendors/types"

export type TrendDirection = "down" | "neutral" | "up"

export type DashboardKpi = {
  change: string
  description: string
  id: string
  label: string
  trend: TrendDirection
  value: string
}

export type VendorPerformancePoint = {
  deliveryScore: number
  month: string
  qualityScore: number
}

export type VendorCategoryDistribution = {
  category: string
  id: string
  value: number
}

export type MonthlyPurchaseValuePoint = {
  month: string
  value: number
}

export type VendorRatingDistributionPoint = {
  rating: string
  vendors: number
}

export type RecentVendor = Pick<
  Vendor,
  | "category"
  | "code"
  | "id"
  | "name"
  | "rating"
  | "status"
  | "totalPurchase"
>

export type DashboardResponse = {
  categoryDistribution: VendorCategoryDistribution[]
  kpis: DashboardKpi[]
  monthlyPurchaseValue: MonthlyPurchaseValuePoint[]
  performance: VendorPerformancePoint[]
  recentVendors: RecentVendor[]
  updatedAt: string
  vendorRatingDistribution: VendorRatingDistributionPoint[]
}
