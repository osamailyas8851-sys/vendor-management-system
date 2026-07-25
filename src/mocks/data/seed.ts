import type { VendorPerformancePoint } from "@/features/dashboard/types"
import type {
  ApprovalComment,
  ApprovalStatus,
  VendorApproval,
} from "@/features/approvals/types"
import type {
  VendorNotification,
} from "@/features/notifications/types"
import type {
  Vendor,
  VendorPaymentTerms,
  VendorProfile,
  VendorStatus,
} from "@/features/vendors/types"
import type { MockDatabase, PurchaseOrder } from "@/mocks/db/types"

const categories = [
  "Steel & Metals",
  "Machinery",
  "Electrical",
  "Logistics",
  "Services",
  "Raw Materials",
] as const

type VendorSeedBase = Omit<
  Vendor,
  | "address"
  | "bankDetails"
  | "certifications"
  | "contactDetails"
  | "gst"
  | "pan"
  | "paymentTerms"
>

const recentVendors: VendorSeedBase[] = [
  {
    id: "vendor-001",
    name: "Tata Steel Processing",
    code: "VND-2026-041",
    category: "Steel & Metals",
    contactPerson: "Rohan Mehta",
    city: "Jamshedpur",
    rating: 4.8,
    status: "Active",
    totalPurchase: 8_450_000,
    createdAt: "2026-07-25T07:30:00.000Z",
    lastTransaction: "2026-07-24T12:30:00.000Z",
  },
  {
    id: "vendor-002",
    name: "Kirloskar Industrial",
    code: "VND-2026-040",
    category: "Machinery",
    contactPerson: "Neha Kulkarni",
    city: "Pune",
    rating: 4.5,
    status: "Active",
    totalPurchase: 5_720_000,
    createdAt: "2026-07-23T09:15:00.000Z",
    lastTransaction: "2026-07-22T10:15:00.000Z",
  },
  {
    id: "vendor-003",
    name: "Apex Site Logistics",
    code: "VND-2026-039",
    category: "Logistics",
    contactPerson: "Arjun Nair",
    city: "Bengaluru",
    rating: 3.9,
    status: "Pending",
    totalPurchase: 2_180_000,
    createdAt: "2026-07-21T11:45:00.000Z",
    lastTransaction: "2026-07-18T08:45:00.000Z",
  },
  {
    id: "vendor-004",
    name: "VoltEdge Systems",
    code: "VND-2026-038",
    category: "Electrical",
    contactPerson: "Priya Sharma",
    city: "Noida",
    rating: 4.4,
    status: "Active",
    totalPurchase: 3_960_000,
    createdAt: "2026-07-19T06:20:00.000Z",
    lastTransaction: "2026-07-17T14:20:00.000Z",
  },
  {
    id: "vendor-005",
    name: "Northstar Aggregates",
    code: "VND-2026-037",
    category: "Raw Materials",
    contactPerson: "Kabir Singh",
    city: "Jaipur",
    rating: 2.1,
    status: "Blacklisted",
    totalPurchase: 1_240_000,
    createdAt: "2026-07-17T10:00:00.000Z",
    lastTransaction: "2026-06-29T09:30:00.000Z",
  },
]

function repeat<T>(value: T, count: number) {
  return Array.from({ length: count }, () => value)
}

const cityState: Record<string, string> = {
  Ahmedabad: "Gujarat",
  Bengaluru: "Karnataka",
  Chennai: "Tamil Nadu",
  Delhi: "Delhi",
  Hyderabad: "Telangana",
  Jaipur: "Rajasthan",
  Jamshedpur: "Jharkhand",
  Kolkata: "West Bengal",
  Mumbai: "Maharashtra",
  Noida: "Uttar Pradesh",
  Pune: "Maharashtra",
}

const paymentTerms: VendorPaymentTerms[] = [
  "Net 30",
  "Net 45",
  "Net 60",
  "Net 15",
]

function enrichVendor(vendor: VendorSeedBase, index: number): Vendor {
  const pan = `ABCDE${String(1000 + (index % 9000)).padStart(4, "0")}F`
  const normalizedName = vendor.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "")

  return {
    ...vendor,
    gst: `27${pan}1Z5`,
    pan,
    paymentTerms: paymentTerms[index % paymentTerms.length],
    certifications: [
      "ISO 9001:2015",
      ...(index % 3 === 0 ? ["ISO 14001:2015"] : []),
    ],
    address: {
      line1: `${120 + (index % 80)}, Industrial Estate`,
      line2: index % 2 === 0 ? "Phase II" : undefined,
      city: vendor.city,
      state: cityState[vendor.city] ?? "Maharashtra",
      postalCode: String(400001 + (index % 999)).padStart(6, "0"),
      country: "India",
    },
    contactDetails: {
      name: vendor.contactPerson,
      designation: "Account Manager",
      email: `${normalizedName}@example.com`,
      phone: `9${String(100000000 + (index * 73_919) % 899_999_999).slice(0, 9)}`,
    },
    bankDetails: {
      accountName: vendor.name,
      accountNumber: String(100_000_000_000 + index * 93_719),
      bankName: index % 2 === 0 ? "HDFC Bank" : "State Bank of India",
      ifscCode: index % 2 === 0 ? "HDFC0001234" : "SBIN0004321",
    },
  }
}

function createSeedVendors(): Vendor[] {
  const cities = [
    "Mumbai",
    "Pune",
    "Bengaluru",
    "Chennai",
    "Hyderabad",
    "Ahmedabad",
    "Delhi",
    "Kolkata",
  ] as const
  const contactFirstNames = [
    "Aarav",
    "Diya",
    "Ishaan",
    "Kavya",
    "Rahul",
    "Meera",
    "Vikram",
    "Sneha",
  ] as const
  const contactLastNames = [
    "Shah",
    "Patel",
    "Reddy",
    "Gupta",
    "Joshi",
    "Iyer",
    "Kapoor",
    "Desai",
  ] as const
  const statuses: VendorStatus[] = [
    ...repeat<VendorStatus>("Active", 193),
    ...repeat<VendorStatus>("Pending", 13),
    ...repeat<VendorStatus>("Blacklisted", 6),
    ...repeat<VendorStatus>("Inactive", 31),
  ]
  const ratings = [
    ...repeat(5, 114),
    ...repeat(4, 105),
    ...repeat(3, 18),
    ...repeat(2, 4),
    ...repeat(1, 2),
  ]

  const generatedVendors = statuses.map((status, index) => ({
    id: `vendor-seed-${String(index + 1).padStart(3, "0")}`,
    name: `Field Partner ${String(index + 1).padStart(3, "0")}`,
    code: `VND-2025-${String(index + 1).padStart(3, "0")}`,
    category: categories[index % categories.length],
    contactPerson: `${contactFirstNames[index % contactFirstNames.length]} ${contactLastNames[(index * 3) % contactLastNames.length]}`,
    city: cities[(index * 5) % cities.length],
    rating: ratings[index],
    status,
    totalPurchase: 450_000 + ((index * 137_000) % 7_500_000),
    createdAt: new Date(
      Date.UTC(2025, index % 12, (index % 27) + 1, 8)
    ).toISOString(),
    lastTransaction: new Date(
      Date.UTC(2026, index % 7, (index % 27) + 1, 11)
    ).toISOString(),
  }))

  return [...recentVendors, ...generatedVendors].map(enrichVendor)
}

const monthlyPurchaseTargets = [
  { month: "2026-02", value: 24_500_000, activeOrders: 10 },
  { month: "2026-03", value: 27_800_000, activeOrders: 10 },
  { month: "2026-04", value: 26_200_000, activeOrders: 10 },
  { month: "2026-05", value: 31_000_000, activeOrders: 10 },
  { month: "2026-06", value: 34_200_000, activeOrders: 10 },
  { month: "2026-07", value: 38_100_000, activeOrders: 18 },
] as const

function createSeedPurchaseOrders(vendors: Vendor[]): PurchaseOrder[] {
  const activeVendors = vendors.filter((vendor) => vendor.status === "Active")
  const activeOrderTotal = monthlyPurchaseTargets.reduce(
    (total, month) => total + month.activeOrders,
    0
  )
  const targetActiveValue = 38_000_000
  const standardActiveValue = Math.floor(targetActiveValue / activeOrderTotal)
  const orders: PurchaseOrder[] = []
  let activeValueAssigned = 0
  let activeOrderIndex = 0

  monthlyPurchaseTargets.forEach((month, monthIndex) => {
    let monthActiveValue = 0

    for (let index = 0; index < month.activeOrders; index += 1) {
      const isLastActiveOrder = activeOrderIndex === activeOrderTotal - 1
      const value = isLastActiveOrder
        ? targetActiveValue - activeValueAssigned
        : standardActiveValue

      orders.push({
        id: `po-active-${String(activeOrderIndex + 1).padStart(3, "0")}`,
        vendorId: activeVendors[activeOrderIndex % activeVendors.length].id,
        value,
        status: "Active",
        createdAt: `${month.month}-${String((index % 24) + 1).padStart(2, "0")}T08:00:00.000Z`,
      })

      activeValueAssigned += value
      monthActiveValue += value
      activeOrderIndex += 1
    }

    orders.push({
      id: `po-completed-${String(monthIndex + 1).padStart(3, "0")}`,
      vendorId: activeVendors[(monthIndex * 17) % activeVendors.length].id,
      value: month.value - monthActiveValue,
      status: "Completed",
      createdAt: `${month.month}-25T08:00:00.000Z`,
    })
  })

  return orders
}

const performanceHistory: VendorPerformancePoint[] = [
  { month: "Feb", qualityScore: 82, deliveryScore: 77 },
  { month: "Mar", qualityScore: 84, deliveryScore: 80 },
  { month: "Apr", qualityScore: 83, deliveryScore: 82 },
  { month: "May", qualityScore: 87, deliveryScore: 84 },
  { month: "Jun", qualityScore: 89, deliveryScore: 86 },
  { month: "Jul", qualityScore: 91, deliveryScore: 88 },
]

const projectNames = [
  "Metro Corridor Expansion",
  "Plant Modernisation Phase II",
  "Regional Warehouse Programme",
  "Renewable Energy Retrofit",
] as const

const monthLabels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"] as const

function clampScore(value: number) {
  return Math.min(98, Math.max(55, Math.round(value)))
}

export function createVendorProfile(
  vendor: Vendor,
  vendorIndex = 0
): VendorProfile {
  const normalizedName = vendor.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "")
  const baseScore = vendor.rating > 0 ? vendor.rating * 19 : 72
  const history = monthLabels.map((month, index) => ({
    month,
    qualityScore: clampScore(baseScore - 5 + index + ((vendorIndex + index) % 3)),
    deliveryScore: clampScore(baseScore - 8 + index + ((vendorIndex * 2 + index) % 4)),
  }))

  return {
    contacts: [
      {
        id: `${vendor.id}-contact-primary`,
        name: vendor.contactPerson,
        role: vendor.contactDetails.designation,
        email: vendor.contactDetails.email,
        phone: `+91 ${vendor.contactDetails.phone}`,
        isPrimary: true,
      },
      {
        id: `${vendor.id}-contact-finance`,
        name: `Finance Desk — ${vendor.name}`,
        role: "Accounts and Payments",
        email: `accounts.${normalizedName}@example.com`,
        phone: `+91 97${String(10_000_000 + (vendorIndex * 41_273) % 89_999_999).slice(0, 8)}`,
        isPrimary: false,
      },
    ],
    performance: {
      qualityScore: history.at(-1)?.qualityScore ?? 0,
      deliveryScore: history.at(-1)?.deliveryScore ?? 0,
      complianceScore: clampScore(baseScore - 1 + (vendorIndex % 5)),
      responseScore: clampScore(baseScore - 3 + (vendorIndex % 7)),
      history,
    },
    documents: [
      {
        id: `${vendor.id}-document-1`,
        name: "GST registration certificate.pdf",
        type: "Tax Registration",
        status: "Approved",
        uploadedAt: vendor.createdAt,
      },
      {
        id: `${vendor.id}-document-2`,
        name: "Bank account verification.pdf",
        type: "Banking",
        status: vendor.status === "Pending" ? "Pending Review" : "Approved",
        uploadedAt: vendor.createdAt,
      },
      {
        id: `${vendor.id}-document-3`,
        name: "Quality compliance declaration.pdf",
        type: "Compliance",
        status: vendor.status === "Blacklisted" ? "Expired" : "Approved",
        uploadedAt: "2026-04-18T08:00:00.000Z",
      },
    ],
    payments: Array.from({ length: 4 }, (_, index) => {
      const status =
        index === 0 && vendorIndex % 9 === 0
          ? "Overdue"
          : index < 3
            ? "Paid"
            : "Pending"
      const dueDate = new Date(Date.UTC(2026, 3 + index, 12 + (vendorIndex % 8)))

      return {
        id: `${vendor.id}-payment-${index + 1}`,
        invoiceNumber: `INV-${vendor.code.slice(-7)}-${String(index + 1).padStart(2, "0")}`,
        amount: 185_000 + ((vendorIndex * 93_000 + index * 147_000) % 1_250_000),
        status,
        dueDate: dueDate.toISOString(),
        paidAt:
          status === "Paid"
            ? new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
            : null,
      }
    }),
    projects: [
      {
        id: `${vendor.id}-project-1`,
        code: `PRJ-${String(2400 + vendorIndex).padStart(4, "0")}`,
        name: projectNames[vendorIndex % projectNames.length],
        role: vendor.category === "Logistics" ? "Logistics partner" : "Material supplier",
        status: vendor.status === "Inactive" ? "On Hold" : "Active",
        startedAt: "2026-01-15T08:00:00.000Z",
      },
      {
        id: `${vendor.id}-project-2`,
        code: `PRJ-${String(1900 + vendorIndex).padStart(4, "0")}`,
        name: projectNames[(vendorIndex + 2) % projectNames.length],
        role: "Approved vendor",
        status: "Completed",
        startedAt: "2025-06-10T08:00:00.000Z",
      },
    ],
    issues:
      vendorIndex % 3 === 0
        ? [
            {
              id: `${vendor.id}-issue-1`,
              title: "Delivery documentation requires correction",
              severity: vendorIndex % 9 === 0 ? "High" : "Medium",
              status: vendor.status === "Blacklisted" ? "Open" : "In Progress",
              createdAt: "2026-07-12T09:00:00.000Z",
            },
          ]
        : [],
    auditTimeline: [
      {
        id: `${vendor.id}-audit-1`,
        action: "Vendor created",
        actor: "Ananya Rao",
        description: "Vendor record created and submitted for verification.",
        createdAt: vendor.createdAt,
      },
      {
        id: `${vendor.id}-audit-2`,
        action: "KYC documents reviewed",
        actor: "Procurement Operations",
        description: "Tax, banking and compliance documents were reviewed.",
        createdAt: "2026-04-20T10:30:00.000Z",
      },
      {
        id: `${vendor.id}-audit-3`,
        action: `Status changed to ${vendor.status}`,
        actor: "Vendor Governance Team",
        description: `Vendor status was updated to ${vendor.status.toLowerCase()}.`,
        createdAt: "2026-06-18T07:45:00.000Z",
      },
      ...(vendor.lastTransaction
        ? [
            {
              id: `${vendor.id}-audit-4`,
              action: "Purchase transaction recorded",
              actor: "Purchase Order Service",
              description: "The latest purchase transaction was recorded.",
              createdAt: vendor.lastTransaction,
            },
          ]
        : []),
    ].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
  }
}

const approvalReviewer = "Ritika Malhotra"
const approvalReviewerRole = "Vendor Governance Lead"
const approvalSeedNow = new Date("2026-07-25T08:15:00.000Z").getTime()

function getApprovalStatus(vendor: Vendor): ApprovalStatus {
  if (vendor.status === "Active") return "Approved"
  if (vendor.status === "Blacklisted") return "Rejected"
  if (vendor.status === "Inactive") return "On Hold"
  return "Pending"
}

export function createVendorApproval(
  vendor: Vendor,
  vendorIndex = 0
): VendorApproval {
  const status = getApprovalStatus(vendor)
  const submittedAt = vendor.createdAt
  const submittedTime = new Date(submittedAt).getTime()
  const reviewTime = Math.max(
    submittedTime,
    Math.min(
      submittedTime + (1 + (vendorIndex % 4)) * 24 * 60 * 60 * 1000,
      approvalSeedNow
    )
  )
  const reviewedAt = new Date(reviewTime).toISOString()
  const decisionComment =
    status === "Rejected"
      ? "The compliance documents could not be verified. Please submit current registrations before onboarding again."
      : status === "On Hold"
        ? "Please provide renewed compliance certificates and updated bank verification."
        : undefined
  const comments: ApprovalComment[] = decisionComment
    ? [
        {
          author: approvalReviewer,
          authorRole: approvalReviewerRole,
          createdAt: reviewedAt,
          id: `${vendor.id}-approval-comment-1`,
          message: decisionComment,
        },
      ]
    : []
  const timeline: VendorApproval["timeline"] = [
    {
      action: "Submitted",
      actor: "Ananya Rao",
      actorRole: "Procurement Manager",
      createdAt: submittedAt,
      fromStatus: null,
      id: `${vendor.id}-approval-event-1`,
      toStatus: "Pending",
    },
  ]

  if (status !== "Pending") {
    timeline.unshift({
      action:
        status === "On Hold" ? "Changes Requested" : status,
      actor: approvalReviewer,
      actorRole: approvalReviewerRole,
      comment: decisionComment,
      createdAt: reviewedAt,
      fromStatus: "Pending",
      id: `${vendor.id}-approval-event-2`,
      toStatus: status,
    })
  }

  return {
    assignedReviewer: approvalReviewer,
    comments,
    status,
    submittedAt,
    submittedBy: "Ananya Rao",
    timeline,
    updatedAt: status === "Pending" ? submittedAt : reviewedAt,
    vendorId: vendor.id,
  }
}

function createNotification(
  notification: Omit<VendorNotification, "readAt">,
  markRead = false
): VendorNotification {
  return {
    ...notification,
    readAt: markRead
      ? new Date(new Date(notification.createdAt).getTime() + 30 * 60 * 1000).toISOString()
      : null,
  }
}

function createSeedNotifications(
  vendors: Vendor[],
  vendorProfiles: Record<string, VendorProfile>,
  approvals: Record<string, VendorApproval>
): VendorNotification[] {
  const notifications: VendorNotification[] = []
  const now = new Date("2026-07-25T08:15:00.000Z")
  const vendorById = new Map(vendors.map((vendor) => [vendor.id, vendor]))
  const createdAt = (hoursAgo: number) =>
    new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString()
  const dueAt = (daysFromNow: number) =>
    new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()

  Object.values(approvals)
    .filter((approval) => approval.status === "Pending")
    .slice(0, 8)
    .forEach((approval, index) => {
      const vendor = vendorById.get(approval.vendorId)

      if (!vendor) return

      notifications.push(
        createNotification(
          {
            createdAt: createdAt(1 + index * 3),
            description: `${vendor.code} requires a procurement decision before onboarding can continue.`,
            dueAt: dueAt(1 + (index % 3)),
            id: `${vendor.id}-notification-approval`,
            priority: index < 3 ? "High" : "Medium",
            title: `${vendor.name} is awaiting approval`,
            type: "Approval Pending",
            vendorId: vendor.id,
            vendorName: vendor.name,
          },
          index === 7
        )
      )
    })

  ;[0, 4, 37, 74, 111, 148].forEach((vendorIndex, index) => {
    const vendor = vendors[vendorIndex]
    const document = vendorProfiles[vendor?.id]?.documents[index % 3]

    if (!vendor || !document) return

    const daysRemaining = 7 + index * 5
    notifications.push(
      createNotification(
        {
          createdAt: createdAt(5 + index * 8),
          description: `${document.name} will expire in ${daysRemaining} days. Upload a renewed document to maintain compliance.`,
          dueAt: dueAt(daysRemaining),
          id: `${vendor.id}-notification-document-${index + 1}`,
          priority: daysRemaining <= 12 ? "High" : "Medium",
          title: `Document expiring for ${vendor.name}`,
          type: "Document Expiring",
          vendorId: vendor.id,
          vendorName: vendor.name,
        },
        index === 5
      )
    )
  })

  vendors
    .filter((vendor) => vendor.rating > 0 && vendor.rating < 3)
    .slice(0, 6)
    .forEach((vendor, index) => {
      notifications.push(
        createNotification({
          createdAt: createdAt(8 + index * 11),
          description: `The current vendor rating is ${vendor.rating.toFixed(1)} out of 5 and requires a performance review.`,
          id: `${vendor.id}-notification-rating`,
          priority: vendor.rating <= 2 ? "Critical" : "High",
          title: `Low rating detected for ${vendor.name}`,
          type: "Low Vendor Rating",
          vendorId: vendor.id,
          vendorName: vendor.name,
        })
      )
    })

  vendors
    .filter((vendor) => {
      const profile = vendorProfiles[vendor.id]
      return profile && profile.performance.deliveryScore < 80
    })
    .slice(0, 8)
    .forEach((vendor, index) => {
      const deliveryScore = vendorProfiles[vendor.id].performance.deliveryScore
      notifications.push(
        createNotification(
          {
            createdAt: createdAt(11 + index * 7),
            description: `On-time delivery performance has fallen to ${deliveryScore}%. Review active orders and recovery actions.`,
            dueAt: dueAt(2 + (index % 4)),
            id: `${vendor.id}-notification-delivery`,
            priority: deliveryScore < 70 ? "High" : "Medium",
            title: `Delayed delivery risk for ${vendor.name}`,
            type: "Delayed Delivery",
            vendorId: vendor.id,
            vendorName: vendor.name,
          },
          index === 6
        )
      )
    })

  const paymentCandidates = vendors.flatMap((vendor) =>
    vendorProfiles[vendor.id].payments
      .filter((payment) => payment.status !== "Paid")
      .map((payment) => ({ payment, vendor }))
  )

  paymentCandidates.slice(0, 10).forEach(({ payment, vendor }, index) => {
    const isOverdue = payment.status === "Overdue"
    notifications.push(
      createNotification(
        {
          createdAt: createdAt(14 + index * 5),
          description: `${payment.invoiceNumber} for ₹${payment.amount.toLocaleString("en-IN")} ${isOverdue ? "is overdue" : "is approaching its due date"}.`,
          dueAt: payment.dueDate,
          id: `${payment.id}-notification-payment`,
          priority: isOverdue ? "High" : "Medium",
          title: `${isOverdue ? "Payment overdue" : "Payment due"} for ${vendor.name}`,
          type: "Payment Due",
          vendorId: vendor.id,
          vendorName: vendor.name,
        },
        index === 8
      )
    )
  })

  return notifications.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  )
}

export function createSeedDatabase(): MockDatabase {
  const vendors = createSeedVendors()
  const vendorProfiles = Object.fromEntries(
    vendors.map((vendor, index) => [
      vendor.id,
      createVendorProfile(vendor, index),
    ])
  )
  const approvals = Object.fromEntries(
    vendors.map((vendor, index) => [
      vendor.id,
      createVendorApproval(vendor, index),
    ])
  )

  return {
    approvals,
    notifications: createSeedNotifications(vendors, vendorProfiles, approvals),
    performanceHistory,
    purchaseOrders: createSeedPurchaseOrders(vendors),
    updatedAt: "2026-07-25T08:15:00.000Z",
    vendorProfiles,
    vendors,
    version: 6,
  }
}
