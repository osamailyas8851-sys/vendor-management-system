import type {
  AddApprovalCommentInput,
  ApprovalActionInput,
  ApprovalDetailsResponse,
  ApprovalListResponse,
  ApprovalStatus,
} from "@/features/approvals/types"
import type {
  DashboardResponse,
  MonthlyPurchaseValuePoint,
  RecentVendor,
  VendorCategoryDistribution,
  VendorRatingDistributionPoint,
} from "@/features/dashboard/types"
import type {
  PerformanceIndexResponse,
  PerformanceTrendPoint,
  VendorPerformanceResponse,
  VendorRiskLevel,
} from "@/features/performance/types"
import type {
  NotificationListResponse,
  NotificationType,
} from "@/features/notifications/types"
import type {
  CreateVendorInput,
  Vendor,
  VendorComparisonResponse,
  VendorDetailsResponse,
  VendorListResponse,
  VendorProfile,
} from "@/features/vendors/types"
import {
  createSeedDatabase,
  createVendorApproval,
  createVendorProfile,
} from "@/mocks/data/seed"
import type { MockDatabase } from "@/mocks/db/types"

const STORAGE_KEY = "fieldnerve.mock-database.v6"
const CRORE = 10_000_000

let memoryDatabase: MockDatabase | null = null

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function getStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function isMockDatabase(value: unknown): value is MockDatabase {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<MockDatabase>

  return (
    candidate.version === 6 &&
    Boolean(candidate.approvals) &&
    typeof candidate.approvals === "object" &&
    Array.isArray(candidate.notifications) &&
    Array.isArray(candidate.vendors) &&
    Array.isArray(candidate.purchaseOrders) &&
    Array.isArray(candidate.performanceHistory) &&
    Boolean(candidate.vendorProfiles) &&
    typeof candidate.vendorProfiles === "object"
  )
}

function saveDatabase(database: MockDatabase) {
  memoryDatabase = clone(database)

  try {
    getStorage()?.setItem(STORAGE_KEY, JSON.stringify(database))
  } catch {
    // The in-memory fallback keeps the mock API usable when storage is blocked.
  }
}

function readDatabase(): MockDatabase {
  const storage = getStorage()

  try {
    const storedValue = storage?.getItem(STORAGE_KEY)

    if (storedValue) {
      const parsedValue: unknown = JSON.parse(storedValue)

      if (isMockDatabase(parsedValue)) {
        memoryDatabase = clone(parsedValue)
        return clone(parsedValue)
      }
    }
  } catch {
    // Invalid or unavailable storage falls through to the safe seed/fallback.
  }

  if (memoryDatabase) {
    return clone(memoryDatabase)
  }

  const seededDatabase = createSeedDatabase()
  saveDatabase(seededDatabase)
  return clone(seededDatabase)
}

function toCategoryId(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function getCategoryDistribution(
  vendors: Vendor[]
): VendorCategoryDistribution[] {
  const categories = new Map<string, number>()

  vendors
    .filter((vendor) => vendor.status === "Active")
    .forEach((vendor) => {
      categories.set(vendor.category, (categories.get(vendor.category) ?? 0) + 1)
    })

  return Array.from(categories, ([category, value]) => ({
    category,
    id: toCategoryId(category),
    value,
  })).sort((left, right) => right.value - left.value)
}

function getRatingDistribution(
  vendors: Vendor[]
): VendorRatingDistributionPoint[] {
  const counts = new Map<number, number>([
    [5, 0],
    [4, 0],
    [3, 0],
    [2, 0],
    [1, 0],
  ])

  vendors.forEach((vendor) => {
    if (vendor.rating <= 0) {
      return
    }

    const rating = Math.min(5, Math.max(1, Math.round(vendor.rating)))
    counts.set(rating, (counts.get(rating) ?? 0) + 1)
  })

  return Array.from(counts, ([rating, vendorsInBucket]) => ({
    rating: rating === 1 ? "1 star" : `${rating} stars`,
    vendors: vendorsInBucket,
  })).sort((left, right) => Number(right.rating[0]) - Number(left.rating[0]))
}

function getMonthlyPurchaseValue(
  database: MockDatabase
): MonthlyPurchaseValuePoint[] {
  const totals = new Map<string, number>()

  database.purchaseOrders.forEach((order) => {
    const monthKey = order.createdAt.slice(0, 7)
    totals.set(monthKey, (totals.get(monthKey) ?? 0) + order.value)
  })

  return Array.from(totals, ([monthKey, value]) => ({
    monthKey,
    value: Number((value / CRORE).toFixed(2)),
  }))
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey))
    .slice(-6)
    .map(({ monthKey, value }) => ({
      month: new Intl.DateTimeFormat("en", {
        month: "short",
        timeZone: "UTC",
      }).format(new Date(`${monthKey}-01T00:00:00.000Z`)),
      value,
    }))
}

function getRecentVendors(vendors: Vendor[]): RecentVendor[] {
  return [...vendors]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 5)
    .map(
      ({ category, code, id, name, rating, status, totalPurchase }) => ({
        category,
        code,
        id,
        name,
        rating,
        status,
        totalPurchase,
      })
    )
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function getRiskLevel(riskScore: number): VendorRiskLevel {
  if (riskScore <= 25) return "Low"
  if (riskScore <= 50) return "Medium"
  if (riskScore <= 70) return "High"
  return "Critical"
}

function getVendorRisk(vendor: Vendor, profile: VendorProfile) {
  const unresolvedIssues = profile.issues.filter(
    (issue) => issue.status !== "Resolved"
  )
  const issuePenalty = unresolvedIssues.reduce(
    (total, issue) =>
      total +
      ({ Critical: 22, High: 16, Low: 5, Medium: 10 }[issue.severity] ?? 0),
    0
  )
  const overduePayments = profile.payments.filter(
    (payment) => payment.status === "Overdue"
  ).length
  const pendingPayments = profile.payments.filter(
    (payment) => payment.status === "Pending"
  ).length
  const operationalPenalty =
    vendor.status === "Blacklisted"
      ? 45
      : vendor.status === "Inactive"
        ? 18
        : vendor.status === "Pending"
          ? 10
          : 0
  const riskScore = clampScore(
    (100 - profile.performance.qualityScore) * 0.25 +
      (100 - profile.performance.deliveryScore) * 0.25 +
      (100 - profile.performance.complianceScore) * 0.2 +
      (100 - profile.performance.responseScore) * 0.1 +
      issuePenalty +
      overduePayments * 12 +
      pendingPayments * 2 +
      operationalPenalty
  )

  return { riskLevel: getRiskLevel(riskScore), riskScore }
}

function getResponseTimeHours(responseScore: number) {
  return Number(Math.max(1.2, (100 - responseScore) * 0.45 + 1.2).toFixed(1))
}

function getPerformanceTrend(
  profile: VendorProfile,
  currentRiskScore: number
): PerformanceTrendPoint[] {
  const finalHistoryIndex = Math.max(profile.performance.history.length - 1, 1)

  return profile.performance.history.map((point, index) => {
    const performanceRisk =
      (100 - point.qualityScore) * 0.48 +
      (100 - point.deliveryScore) * 0.42 +
      (100 - profile.performance.responseScore) * 0.1
    const currentRiskWeight = index / finalHistoryIndex

    return {
      ...point,
      riskScore: clampScore(
        performanceRisk * (1 - currentRiskWeight) +
          currentRiskScore * currentRiskWeight
      ),
    }
  })
}

export function getPerformanceIndexFromDatabase(): PerformanceIndexResponse {
  const database = readDatabase()
  const items = database.vendors
    .flatMap((vendor) => {
      const profile = database.vendorProfiles[vendor.id]

      if (!profile) return []

      const risk = getVendorRisk(vendor, profile)

      return [
        {
          category: vendor.category,
          code: vendor.code,
          id: vendor.id,
          name: vendor.name,
          ...risk,
          status: vendor.status,
        },
      ]
    })

  return clone({ items, total: items.length })
}

export function getVendorPerformanceFromDatabase(
  vendorId: string
): VendorPerformanceResponse | null {
  const database = readDatabase()
  const vendor = database.vendors.find((item) => item.id === vendorId)
  const profile = database.vendorProfiles[vendorId]

  if (!vendor || !profile) return null

  const risk = getVendorRisk(vendor, profile)
  const paymentSummary = profile.payments.reduce(
    (summary, payment) => {
      summary[payment.status.toLowerCase() as "overdue" | "paid" | "pending"] += 1
      summary.totalValue += payment.amount
      return summary
    },
    { overdue: 0, paid: 0, pending: 0, totalValue: 0 }
  )

  return clone({
    metrics: {
      deliveryScore: profile.performance.deliveryScore,
      qualityScore: profile.performance.qualityScore,
      rating: vendor.rating,
      responseTimeHours: getResponseTimeHours(
        profile.performance.responseScore
      ),
      ...risk,
    },
    paymentHistory: [...profile.payments].sort((left, right) =>
      right.dueDate.localeCompare(left.dueDate)
    ),
    paymentSummary,
    recentIssues: [...profile.issues]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5),
    trend: getPerformanceTrend(profile, risk.riskScore),
    updatedAt: database.updatedAt,
    vendor: {
      category: vendor.category,
      city: vendor.city,
      code: vendor.code,
      id: vendor.id,
      name: vendor.name,
      status: vendor.status,
    },
  })
}

export function getDashboardFromDatabase(): DashboardResponse {
  const database = readDatabase()
  const { vendors } = database
  const activeVendors = vendors.filter((vendor) => vendor.status === "Active")
  const blacklistedVendors = vendors.filter(
    (vendor) => vendor.status === "Blacklisted"
  )
  const pendingVendors = vendors.filter((vendor) => vendor.status === "Pending")
  const ratedVendors = vendors.filter((vendor) => vendor.rating > 0)
  const averageRating =
    ratedVendors.reduce((total, vendor) => total + vendor.rating, 0) /
    Math.max(ratedVendors.length, 1)
  const activeOrders = database.purchaseOrders.filter(
    (order) => order.status === "Active"
  )
  const openOrderValue = activeOrders.reduce(
    (total, order) => total + order.value,
    0
  )
  const activityCutoff =
    new Date(database.updatedAt).getTime() - 30 * 24 * 60 * 60 * 1000
  const recentlyAdded = vendors.filter(
    (vendor) => new Date(vendor.createdAt).getTime() >= activityCutoff
  ).length

  return {
    updatedAt: database.updatedAt,
    kpis: [
      {
        id: "total-vendors",
        label: "Total vendors",
        value: vendors.length.toLocaleString("en-IN"),
        change: `+${recentlyAdded}`,
        trend: "up",
        description: "Added in the last 30 days",
      },
      {
        id: "active-vendors",
        label: "Active vendors",
        value: activeVendors.length.toLocaleString("en-IN"),
        change: `${Math.round((activeVendors.length / Math.max(vendors.length, 1)) * 100)}%`,
        trend: "up",
        description: "Of the complete vendor base",
      },
      {
        id: "blacklisted-vendors",
        label: "Blacklisted vendors",
        value: blacklistedVendors.length.toLocaleString("en-IN"),
        change: `${blacklistedVendors.length} total`,
        trend: "neutral",
        description: "Blocked from new purchase orders",
      },
      {
        id: "pending-approvals",
        label: "Pending approvals",
        value: pendingVendors.length.toLocaleString("en-IN"),
        change: `${pendingVendors.length} awaiting review`,
        trend: "neutral",
        description: "Require a procurement decision",
      },
      {
        id: "average-rating",
        label: "Average vendor rating",
        value: averageRating.toFixed(1),
        change: `${ratedVendors.length} rated`,
        trend: "up",
        description: "Across vendors with a rating",
      },
      {
        id: "active-orders",
        label: "Active purchase orders",
        value: activeOrders.length.toLocaleString("en-IN"),
        change: `₹${(openOrderValue / CRORE).toFixed(1)} Cr`,
        trend: "neutral",
        description: "Combined open order value",
      },
    ],
    performance: clone(database.performanceHistory),
    categoryDistribution: getCategoryDistribution(vendors),
    monthlyPurchaseValue: getMonthlyPurchaseValue(database),
    recentVendors: getRecentVendors(vendors),
    vendorRatingDistribution: getRatingDistribution(vendors),
  }
}

export function getVendorsFromDatabase(): VendorListResponse {
  const vendors = readDatabase().vendors.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  )

  return {
    items: vendors,
    total: vendors.length,
  }
}

export function getVendorComparisonFromDatabase(
  vendorIds: string[]
): VendorComparisonResponse {
  const database = readDatabase()
  const uniqueIds = [...new Set(vendorIds)].slice(0, 4)
  const items = uniqueIds.flatMap((vendorId) => {
    const vendor = database.vendors.find((item) => item.id === vendorId)
    const profile = database.vendorProfiles[vendorId]

    if (!vendor || !profile) return []

    const orders = database.purchaseOrders.filter(
      (order) => order.vendorId === vendorId
    )
    const orderValue = orders.reduce((total, order) => total + order.value, 0)
    const risk = getVendorRisk(vendor, profile)

    return [
      {
        averageOrderValue: orders.length
          ? Math.round(orderValue / orders.length)
          : 0,
        category: vendor.category,
        certifications: vendor.certifications,
        city: vendor.city,
        code: vendor.code,
        deliveryScore: profile.performance.deliveryScore,
        id: vendor.id,
        name: vendor.name,
        orderCount: orders.length,
        paymentTerms: vendor.paymentTerms,
        rating: vendor.rating,
        ...risk,
        status: vendor.status,
        totalPurchaseValue: vendor.totalPurchase,
      },
    ]
  })

  return clone({ items, updatedAt: database.updatedAt })
}

function createNotificationListResponse(
  database: MockDatabase
): NotificationListResponse {
  const counts: Record<NotificationType, number> = {
    "Approval Pending": 0,
    "Delayed Delivery": 0,
    "Document Expiring": 0,
    "Low Vendor Rating": 0,
    "Payment Due": 0,
  }
  const items = [...database.notifications].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  )

  items.forEach((notification) => {
    counts[notification.type] += 1
  })

  return clone({
    counts,
    items,
    total: items.length,
    unread: items.filter((notification) => !notification.readAt).length,
  })
}

export function getNotificationsFromDatabase(): NotificationListResponse {
  return createNotificationListResponse(readDatabase())
}

export function markNotificationReadInDatabase(
  notificationId: string
): NotificationListResponse | null {
  const database = readDatabase()
  const notification = database.notifications.find(
    (item) => item.id === notificationId
  )

  if (!notification) return null

  notification.readAt ??= new Date().toISOString()
  saveDatabase(database)

  return createNotificationListResponse(database)
}

export function markAllNotificationsReadInDatabase(): NotificationListResponse {
  const database = readDatabase()
  const readAt = new Date().toISOString()

  database.notifications.forEach((notification) => {
    notification.readAt ??= readAt
  })
  saveDatabase(database)

  return createNotificationListResponse(database)
}

export function getApprovalsFromDatabase(): ApprovalListResponse {
  const database = readDatabase()
  const counts: Record<ApprovalStatus, number> = {
    Approved: 0,
    "On Hold": 0,
    Pending: 0,
    Rejected: 0,
  }
  const statusPriority: Record<ApprovalStatus, number> = {
    Pending: 0,
    "On Hold": 1,
    Approved: 2,
    Rejected: 3,
  }
  const items = database.vendors
    .flatMap((vendor) => {
      const approval = database.approvals[vendor.id]

      if (!approval) return []

      counts[approval.status] += 1

      return [
        {
          assignedReviewer: approval.assignedReviewer,
          category: vendor.category,
          city: vendor.city,
          code: vendor.code,
          status: approval.status,
          submittedAt: approval.submittedAt,
          submittedBy: approval.submittedBy,
          updatedAt: approval.updatedAt,
          vendorId: vendor.id,
          vendorName: vendor.name,
        },
      ]
    })
    .sort(
      (left, right) =>
        statusPriority[left.status] - statusPriority[right.status] ||
        right.updatedAt.localeCompare(left.updatedAt)
    )

  return clone({ counts, items, total: items.length })
}

export function getApprovalDetailsFromDatabase(
  vendorId: string
): ApprovalDetailsResponse | null {
  const database = readDatabase()
  const vendor = database.vendors.find((item) => item.id === vendorId)
  const approval = database.approvals[vendorId]
  const profile = database.vendorProfiles[vendorId]

  if (!vendor || !approval || !profile) return null

  return clone({
    approval,
    documents: profile.documents,
    vendor,
  })
}

export function addApprovalCommentInDatabase(
  vendorId: string,
  input: AddApprovalCommentInput
): ApprovalDetailsResponse | null {
  const database = readDatabase()
  const vendor = database.vendors.find((item) => item.id === vendorId)
  const approval = database.approvals[vendorId]
  const profile = database.vendorProfiles[vendorId]

  if (!vendor || !approval || !profile) return null

  const createdAt = new Date().toISOString()
  const eventId = globalThis.crypto?.randomUUID?.() ?? `comment-${createdAt}`
  const message = input.message.trim()

  approval.comments.unshift({
    author: "Ananya Rao",
    authorRole: "Procurement Manager",
    createdAt,
    id: eventId,
    message,
  })
  approval.timeline.unshift({
    action: "Comment Added",
    actor: "Ananya Rao",
    actorRole: "Procurement Manager",
    comment: message,
    createdAt,
    fromStatus: approval.status,
    id: `${eventId}-timeline`,
    toStatus: approval.status,
  })
  approval.updatedAt = createdAt
  database.updatedAt = createdAt
  saveDatabase(database)

  return clone({ approval, documents: profile.documents, vendor })
}

export function applyApprovalActionInDatabase(
  vendorId: string,
  input: ApprovalActionInput
): ApprovalDetailsResponse | null {
  const database = readDatabase()
  const vendor = database.vendors.find((item) => item.id === vendorId)
  const approval = database.approvals[vendorId]
  const profile = database.vendorProfiles[vendorId]

  if (!vendor || !approval || !profile) return null

  const previousStatus = approval.status
  const nextStatus: ApprovalStatus =
    input.action === "approve"
      ? "Approved"
      : input.action === "reject"
        ? "Rejected"
        : "On Hold"
  const action =
    input.action === "approve"
      ? "Approved"
      : input.action === "reject"
        ? "Rejected"
        : "Changes Requested"
  const createdAt = new Date().toISOString()
  const eventId = globalThis.crypto?.randomUUID?.() ?? `approval-${createdAt}`
  const comment = input.comment?.trim() || undefined

  approval.status = nextStatus
  approval.updatedAt = createdAt
  approval.timeline.unshift({
    action,
    actor: "Ananya Rao",
    actorRole: "Procurement Manager",
    comment,
    createdAt,
    fromStatus: previousStatus,
    id: eventId,
    toStatus: nextStatus,
  })

  database.notifications.forEach((notification) => {
    if (
      notification.vendorId === vendorId &&
      notification.type === "Approval Pending"
    ) {
      notification.readAt ??= createdAt
    }
  })

  if (comment) {
    approval.comments.unshift({
      author: "Ananya Rao",
      authorRole: "Procurement Manager",
      createdAt,
      id: `${eventId}-comment`,
      message: comment,
    })
  }

  vendor.status =
    nextStatus === "Approved"
      ? "Active"
      : nextStatus === "Rejected"
        ? "Inactive"
        : "Pending"

  if (nextStatus === "Approved") {
    profile.documents = profile.documents.map((document) =>
      document.status === "Pending Review"
        ? { ...document, status: "Approved" }
        : document
    )
  }

  profile.auditTimeline.unshift({
    action,
    actor: "Ananya Rao",
    createdAt,
    description: comment
      ? `${action}: ${comment}`
      : `Approval status changed from ${previousStatus} to ${nextStatus}.`,
    id: `${eventId}-audit`,
  })
  database.updatedAt = createdAt
  saveDatabase(database)

  return clone({ approval, documents: profile.documents, vendor })
}

export function getVendorDetailsFromDatabase(
  vendorId: string
): VendorDetailsResponse | null {
  const database = readDatabase()
  const vendor = database.vendors.find((item) => item.id === vendorId)

  if (!vendor) {
    return null
  }

  const profile = database.vendorProfiles[vendor.id]

  if (!profile) {
    return null
  }

  const purchaseHistory = database.purchaseOrders
    .filter((order) => order.vendorId === vendor.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((order, index) => ({
      id: order.id,
      orderNumber: `PO-${order.createdAt.slice(0, 4)}-${String(index + 1).padStart(4, "0")}`,
      createdAt: order.createdAt,
      status: order.status,
      value: order.value,
    }))

  return clone({
    vendor,
    ...profile,
    purchaseHistory,
  })
}

export function createVendorInDatabase(input: CreateVendorInput): Vendor {
  const database = readDatabase()
  const createdAt = new Date().toISOString()
  const sequence = database.vendors.length + 1
  const vendor: Vendor = {
    id: globalThis.crypto?.randomUUID?.() ?? `vendor-${createdAt}-${sequence}`,
    code: `VND-${new Date(createdAt).getUTCFullYear()}-${String(sequence).padStart(3, "0")}`,
    createdAt,
    address: clone(input.address),
    bankDetails: clone(input.bankDetails),
    certifications: [...input.certifications],
    city: input.address.city.trim(),
    contactDetails: clone(input.contactDetails),
    contactPerson: input.contactDetails.name.trim(),
    gst: input.gst.trim().toUpperCase(),
    lastTransaction: null,
    name: input.name.trim(),
    category: input.category.trim(),
    pan: input.pan.trim().toUpperCase(),
    paymentTerms: input.paymentTerms,
    rating: 0,
    status: "Pending",
    totalPurchase: 0,
  }

  database.vendors.push(vendor)
  const vendorProfile = createVendorProfile(
    vendor,
    database.vendors.length - 1
  )
  vendorProfile.documents = input.documents.map((document, index) => ({
    id: `${vendor.id}-document-${index + 1}`,
    name: document.name,
    status: "Pending Review",
    type: document.type || "File",
    uploadedAt: createdAt,
  }))
  database.vendorProfiles[vendor.id] = vendorProfile
  database.approvals[vendor.id] = createVendorApproval(
    vendor,
    database.vendors.length - 1
  )
  database.notifications.unshift({
    createdAt,
    description: `${vendor.code} requires a procurement decision before onboarding can continue.`,
    dueAt: new Date(
      new Date(createdAt).getTime() + 2 * 24 * 60 * 60 * 1000
    ).toISOString(),
    id: `${vendor.id}-notification-approval`,
    priority: "High",
    readAt: null,
    title: `${vendor.name} is awaiting approval`,
    type: "Approval Pending",
    vendorId: vendor.id,
    vendorName: vendor.name,
  })
  database.updatedAt = createdAt
  saveDatabase(database)

  return clone(vendor)
}
