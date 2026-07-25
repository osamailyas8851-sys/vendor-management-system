import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CreateVendorForm } from "@/features/vendors/components/create-vendor-form"

export const Route = createFileRoute("/vendors_/new")({
  component: CreateVendorRoute,
})

function CreateVendorRoute() {
  const navigate = useNavigate()

  return (
    <main className="flex min-w-0 max-w-full flex-1 flex-col gap-5 overflow-x-clip p-4 lg:p-6">
      <div className="flex min-w-0 max-w-full flex-col gap-5">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
          <Button
            className="w-fit"
            render={<Link to="/vendors" />}
            variant="ghost"
          >
            <ArrowLeftIcon />
            Back to vendors
          </Button>

          <div>
            <p className="text-sm text-muted-foreground">Vendor onboarding</p>
            <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
              Create Vendor
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Add legal, contact, banking and compliance information for a new
              vendor. New submissions start in Pending status.
            </p>
          </div>
        </div>

        <CreateVendorForm
          onCancel={() => void navigate({ to: "/vendors" })}
          onCreated={(vendor) =>
            void navigate({
              to: "/vendors/$vendorId",
              params: { vendorId: vendor.id },
            })
          }
        />
      </div>
    </main>
  )
}
