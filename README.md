# FieldNerve Vendor Management Portal

Responsive vendor-management portal built with React, TypeScript and Vite.

Current routes:

- `/` — vendor dashboard and analytics
- `/vendors` — enterprise vendor directory with search, filters, sorting, pagination, saved views, column selection and CSV export
- `/vendors/new` — validated vendor onboarding form
- `/vendors/:vendorId` — vendor details with overview, contacts, performance, purchases, documents, payments, projects, issues and audit history
- `/approvals` — searchable vendor approval queue
- `/approvals/:vendorId` — approval review, comments, timeline and decision actions
- `/performance` — consolidated vendor performance analytics
- `/notifications` — actionable vendor notification center

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Stack

- React 19, TypeScript and Vite
- TanStack Router, Query, Table, Form, Store and Virtual
- shadcn/ui with Base UI primitives and Tailwind CSS
- shadcn Charts with Recharts
- Axios API client
- Mock Service Worker (MSW) for the demo API

## Mock API

MSW is enabled by default so both local and Vercel demo builds work without a separate backend. Set `VITE_ENABLE_MOCKS=false` when connecting a real API, and configure its base URL with `VITE_API_BASE_URL`.

The mock API owns a browser-persistent database under the `fieldnerve.mock-database.v6` storage key. Initial vendor, purchase-order, vendor-profile, approval, notification and performance records are seeded only when that database does not exist. Dashboard metrics and charts are calculated from those records on every `GET /api/dashboard` request.

Data flow:

```text
Dashboard → TanStack Query → Axios → MSW handler → mock database
Add vendor → POST /api/vendors → validate and save → refresh dashboard query
Approval action → POST /api/approvals/:vendorId/actions → persist decision → refresh approval, vendor and dashboard queries
Performance → TanStack Query → Axios → MSW-derived quality, delivery, response, risk, payment and issue data
Notifications → TanStack Query → Axios → MSW notification records with persistent read state
```

The seed data is not imported by dashboard components. Because MSW runs in the browser, this mock database is persistent per browser/device, not shared between different users. A production API and hosted database can later replace MSW without changing the frontend service contracts.

## Deploy to Vercel

Import the repository into Vercel and keep the framework preset as Vite. The included `vercel.json` handles client-side route fallback for TanStack Router.

No test runner or browser-testing dependency is included in this phase.
