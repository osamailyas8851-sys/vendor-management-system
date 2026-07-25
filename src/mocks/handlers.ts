import { delay, http, HttpResponse } from "msw"
import { z } from "zod"

import {
  addApprovalCommentInDatabase,
  applyApprovalActionInDatabase,
  createVendorInDatabase,
  getApprovalDetailsFromDatabase,
  getApprovalsFromDatabase,
  getDashboardFromDatabase,
  getNotificationsFromDatabase,
  getPerformanceIndexFromDatabase,
  getVendorPerformanceFromDatabase,
  getVendorDetailsFromDatabase,
  getVendorsFromDatabase,
  markAllNotificationsReadInDatabase,
  markNotificationReadInDatabase,
} from "@/mocks/db/database"

const approvalActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    comment: z.string().trim().max(1000).optional(),
  }),
  z.object({
    action: z.literal("reject"),
    comment: z.string().trim().min(3).max(1000),
  }),
  z.object({
    action: z.literal("request_changes"),
    comment: z.string().trim().min(3).max(1000),
  }),
])

const approvalCommentSchema = z.object({
  message: z.string().trim().min(2).max(1000),
})

const createVendorSchema = z.object({
  address: z.object({
    city: z.string().trim().min(2).max(80),
    country: z.string().trim().min(2).max(80),
    line1: z.string().trim().min(5).max(160),
    line2: z.string().trim().max(160).optional(),
    postalCode: z.string().regex(/^\d{6}$/),
    state: z.string().trim().min(2).max(80),
  }),
  bankDetails: z.object({
    accountName: z.string().trim().min(2).max(120),
    accountNumber: z.string().regex(/^\d{9,18}$/),
    bankName: z.string().trim().min(2).max(120),
    ifscCode: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  }),
  category: z.string().trim().min(2).max(80),
  certifications: z.array(z.string().trim().min(2).max(120)).min(1).max(10),
  contactDetails: z.object({
    designation: z.string().trim().min(2).max(80),
    email: z.email(),
    name: z.string().trim().min(2).max(120),
    phone: z.string().regex(/^[6-9]\d{9}$/),
  }),
  documents: z
    .array(
      z.object({
        lastModified: z.number().int().nonnegative(),
        name: z.string().trim().min(1).max(180),
        size: z.number().int().positive().max(5 * 1024 * 1024),
        type: z.enum(["application/pdf", "image/jpeg", "image/png"]),
      })
    )
    .min(1)
    .max(5),
  gst: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/),
  name: z.string().trim().min(2).max(120),
  pan: z.string().trim().toUpperCase().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/),
  paymentTerms: z.enum([
    "Advance",
    "Due on receipt",
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
  ]),
})

export const handlers = [
  http.get("/api/dashboard", async () => {
    await delay(550)

    return HttpResponse.json(getDashboardFromDatabase())
  }),
  http.get("/api/vendors", async () => {
    await delay(350)

    return HttpResponse.json(getVendorsFromDatabase())
  }),
  http.get("/api/approvals", async () => {
    await delay(350)

    return HttpResponse.json(getApprovalsFromDatabase())
  }),
  http.get("/api/performance", async () => {
    await delay(350)

    return HttpResponse.json(getPerformanceIndexFromDatabase())
  }),
  http.get("/api/notifications", async () => {
    await delay(300)

    return HttpResponse.json(getNotificationsFromDatabase())
  }),
  http.patch(
    "/api/notifications/:notificationId/read",
    async ({ params }) => {
      await delay(200)

      const notifications = markNotificationReadInDatabase(
        String(params.notificationId)
      )

      if (!notifications) {
        return HttpResponse.json(
          {
            code: "NOTIFICATION_NOT_FOUND",
            message: "The requested notification could not be found.",
          },
          { status: 404 }
        )
      }

      return HttpResponse.json(notifications)
    }
  ),
  http.post("/api/notifications/read-all", async () => {
    await delay(250)

    return HttpResponse.json(markAllNotificationsReadInDatabase())
  }),
  http.get("/api/performance/:vendorId", async ({ params }) => {
    await delay(400)

    const performance = getVendorPerformanceFromDatabase(
      String(params.vendorId)
    )

    if (!performance) {
      return HttpResponse.json(
        {
          code: "PERFORMANCE_NOT_FOUND",
          message: "Performance data for the requested vendor could not be found.",
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(performance)
  }),
  http.get("/api/approvals/:vendorId", async ({ params }) => {
    await delay(350)

    const approval = getApprovalDetailsFromDatabase(String(params.vendorId))

    if (!approval) {
      return HttpResponse.json(
        {
          code: "APPROVAL_NOT_FOUND",
          message: "The requested vendor approval could not be found.",
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(approval)
  }),
  http.post(
    "/api/approvals/:vendorId/comments",
    async ({ params, request }) => {
      await delay(300)

      const approval = getApprovalDetailsFromDatabase(String(params.vendorId))

      if (!approval) {
        return HttpResponse.json(
          {
            code: "APPROVAL_NOT_FOUND",
            message: "The requested vendor approval could not be found.",
          },
          { status: 404 }
        )
      }

      const result = approvalCommentSchema.safeParse(await request.json())

      if (!result.success) {
        return HttpResponse.json(
          {
            code: "VALIDATION_ERROR",
            message: "Enter a comment containing at least 2 characters.",
          },
          { status: 422 }
        )
      }

      return HttpResponse.json(
        addApprovalCommentInDatabase(String(params.vendorId), result.data)
      )
    }
  ),
  http.post(
    "/api/approvals/:vendorId/actions",
    async ({ params, request }) => {
      await delay(450)

      const vendorId = String(params.vendorId)
      const approval = getApprovalDetailsFromDatabase(vendorId)

      if (!approval) {
        return HttpResponse.json(
          {
            code: "APPROVAL_NOT_FOUND",
            message: "The requested vendor approval could not be found.",
          },
          { status: 404 }
        )
      }

      if (
        approval.approval.status === "Approved" ||
        approval.approval.status === "Rejected"
      ) {
        return HttpResponse.json(
          {
            code: "APPROVAL_ALREADY_COMPLETED",
            message: "This approval has already received a final decision.",
          },
          { status: 409 }
        )
      }

      const result = approvalActionSchema.safeParse(await request.json())

      if (!result.success) {
        return HttpResponse.json(
          {
            code: "VALIDATION_ERROR",
            message: "A reason is required when rejecting or requesting changes.",
          },
          { status: 422 }
        )
      }

      if (
        approval.approval.status === "On Hold" &&
        result.data.action === "request_changes"
      ) {
        return HttpResponse.json(
          {
            code: "CHANGES_ALREADY_REQUESTED",
            message: "Changes have already been requested for this vendor.",
          },
          { status: 409 }
        )
      }

      return HttpResponse.json(
        applyApprovalActionInDatabase(vendorId, result.data)
      )
    }
  ),
  http.get("/api/vendors/:vendorId", async ({ params }) => {
    await delay(350)

    const vendorDetails = getVendorDetailsFromDatabase(String(params.vendorId))

    if (!vendorDetails) {
      return HttpResponse.json(
        {
          code: "VENDOR_NOT_FOUND",
          message: "The requested vendor could not be found.",
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(vendorDetails)
  }),
  http.post("/api/vendors", async ({ request }) => {
    await delay(450)

    let requestBody: unknown

    try {
      requestBody = await request.json()
    } catch {
      return HttpResponse.json(
        {
          code: "INVALID_JSON",
          message: "The request body must be valid JSON.",
        },
        { status: 400 }
      )
    }

    const result = createVendorSchema.safeParse(requestBody)

    if (!result.success) {
      return HttpResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Please check the vendor details and try again.",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 422 }
      )
    }

    return HttpResponse.json(createVendorInDatabase(result.data), {
      status: 201,
    })
  }),
]
