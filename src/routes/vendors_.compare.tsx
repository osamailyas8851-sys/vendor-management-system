import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeftIcon, ScaleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { VendorComparisonView } from "@/features/vendors/components/vendor-comparison-view"

export const Route = createFileRoute("/vendors_/compare")({
  component: VendorComparisonRoute,
})

function VendorComparisonRoute() {
  return (
    <main className="flex w-full min-w-0 max-w-full flex-1 flex-col gap-6 overflow-x-hidden p-4 lg:p-6">
      <Button
        className="w-fit"
        render={<Link to="/vendors" />}
        size="sm"
        variant="ghost"
      >
        <ArrowLeftIcon />
        Back to vendors
      </Button>

      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ScaleIcon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Vendor intelligence</p>
          <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight">
            Compare Vendors
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Evaluate pricing, ratings, delivery performance, certifications and risk side by side.
          </p>
        </div>
      </div>

      <VendorComparisonView />
    </main>
  )
}
