import * as React from "react"
import { useForm } from "@tanstack/react-form"
import {
  Building2Icon,
  FileCheck2Icon,
  LandmarkIcon,
  LoaderCircleIcon,
  MapPinIcon,
  PaperclipIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react"
import { z } from "zod"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateVendorMutation } from "@/features/vendors/api/vendors.queries"
import type {
  CreateVendorInput,
  Vendor,
  VendorPaymentTerms,
  VendorUpload,
} from "@/features/vendors/types"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const

const documentSchema = z.object({
  lastModified: z.number().int().nonnegative(),
  name: z.string().min(1),
  size: z
    .number()
    .positive()
    .max(MAX_FILE_SIZE, "Each document must be 5 MB or smaller."),
  type: z.enum(ACCEPTED_FILE_TYPES, {
    error: "Only PDF, JPG and PNG documents are supported.",
  }),
})

const createVendorFormSchema = z.object({
  name: z.string().trim().min(2, "Vendor name must contain at least 2 characters."),
  gst: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Enter a valid 15-character GST number."
    ),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN number."),
  category: z.string().min(1, "Select a vendor category."),
  paymentTerms: z.enum([
    "Advance",
    "Due on receipt",
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
  ]),
  certifications: z
    .string()
    .trim()
    .min(2, "Add at least one certification."),
  address: z.object({
    line1: z.string().trim().min(5, "Enter the registered address."),
    line2: z.string().trim().max(160),
    city: z.string().trim().min(2, "Enter the city."),
    state: z.string().trim().min(2, "Enter the state."),
    postalCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code."),
    country: z.string().trim().min(2, "Enter the country."),
  }),
  contactDetails: z.object({
    name: z.string().trim().min(2, "Enter the contact person's name."),
    designation: z.string().trim().min(2, "Enter the designation."),
    email: z.email("Enter a valid email address."),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  }),
  bankDetails: z.object({
    accountName: z.string().trim().min(2, "Enter the account holder name."),
    accountNumber: z
      .string()
      .regex(/^\d{9,18}$/, "Account number must contain 9–18 digits."),
    bankName: z.string().trim().min(2, "Enter the bank name."),
    ifscCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code."),
  }),
  documents: z
    .array(documentSchema)
    .min(1, "Upload at least one supporting document.")
    .max(5, "You can upload a maximum of 5 documents."),
})

type CreateVendorFormValues = z.infer<typeof createVendorFormSchema>

const defaultValues: CreateVendorFormValues = {
  name: "",
  gst: "",
  pan: "",
  category: "",
  paymentTerms: "Net 30",
  certifications: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
  contactDetails: {
    name: "",
    designation: "",
    email: "",
    phone: "",
  },
  bankDetails: {
    accountName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
  },
  documents: [],
}

const categories = [
  "Steel & Metals",
  "Machinery",
  "Electrical",
  "Logistics",
  "Services",
  "Raw Materials",
] as const

const paymentTerms: VendorPaymentTerms[] = [
  "Advance",
  "Due on receipt",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
]

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message)
  }

  return "This field is invalid."
}

function FieldErrors({
  errors,
  visible,
}: {
  errors: unknown[]
  visible: boolean
}) {
  const messages = Array.from(new Set(errors.map(getErrorMessage)))

  if (!visible || messages.length === 0) {
    return null
  }

  return (
    <div aria-live="polite" className="grid gap-1">
      {messages.map((message) => (
        <p className="text-xs text-destructive" key={message}>
          {message}
        </p>
      ))}
    </div>
  )
}

function FormSection({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: React.ReactNode
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
}) {
  return (
    <Card>
      <CardHeader>
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
      <CardContent>{children}</CardContent>
    </Card>
  )
}

type CreateVendorFormProps = {
  onCancel: () => void
  onCreated: (vendor: Vendor) => void
}

export function CreateVendorForm({
  onCancel,
  onCreated,
}: CreateVendorFormProps) {
  const [attemptedSubmit, setAttemptedSubmit] = React.useState(false)
  const createVendorMutation = useCreateVendorMutation()
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createVendorFormSchema,
    },
    onSubmit: async ({ value }) => {
      const payload: CreateVendorInput = {
        address: {
          ...value.address,
          line1: value.address.line1.trim(),
          line2: value.address.line2.trim() || undefined,
        },
        bankDetails: {
          ...value.bankDetails,
          ifscCode: value.bankDetails.ifscCode.trim().toUpperCase(),
        },
        category: value.category,
        certifications: value.certifications
          .split(",")
          .map((certification) => certification.trim())
          .filter(Boolean),
        contactDetails: value.contactDetails,
        documents: value.documents,
        gst: value.gst.trim().toUpperCase(),
        name: value.name.trim(),
        pan: value.pan.trim().toUpperCase(),
        paymentTerms: value.paymentTerms,
      }
      const vendor = await createVendorMutation.mutateAsync(payload)

      onCreated(vendor)
    },
  })

  return (
    <form
      className="grid min-w-0 max-w-full gap-5 overflow-x-clip"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setAttemptedSubmit(true)
        void form.handleSubmit()
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl gap-5">
        {createVendorMutation.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Vendor could not be created</AlertTitle>
            <AlertDescription>{createVendorMutation.error.message}</AlertDescription>
          </Alert>
        ) : null}

        <FormSection
          description="Legal identity, classification and commercial terms"
          icon={Building2Icon}
          title="Business information"
        >
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="name">
            {(field) => (
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor={field.name}>Vendor Name</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  autoComplete="organization"
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Enter the registered vendor name"
                  value={field.state.value}
                />
                <FieldErrors
                  errors={field.state.meta.errors}
                  visible={attemptedSubmit || field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="gst">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>GST</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  className="uppercase"
                  id={field.name}
                  maxLength={15}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                  placeholder="27ABCDE1234F1Z5"
                  value={field.state.value}
                />
                <FieldErrors
                  errors={field.state.meta.errors}
                  visible={attemptedSubmit || field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="pan">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>PAN</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  className="uppercase"
                  id={field.name}
                  maxLength={10}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  value={field.state.value}
                />
                <FieldErrors
                  errors={field.state.meta.errors}
                  visible={attemptedSubmit || field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="category">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="vendor-category">Vendor Category</Label>
                <Select
                  onOpenChange={(open) => {
                    if (!open) field.handleBlur()
                  }}
                  onValueChange={(value) => field.handleChange(value ?? "")}
                  value={field.state.value}
                >
                  <SelectTrigger
                    aria-invalid={field.state.meta.errors.length > 0}
                    className="w-full"
                    id="vendor-category"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldErrors
                  errors={field.state.meta.errors}
                  visible={attemptedSubmit || field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="paymentTerms">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Select
                  onOpenChange={(open) => {
                    if (!open) field.handleBlur()
                  }}
                  onValueChange={(value) => {
                    if (value) field.handleChange(value)
                  }}
                  value={field.state.value}
                >
                  <SelectTrigger className="w-full" id="payment-terms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTerms.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="certifications">
            {(field) => (
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor={field.name}>Certifications</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="ISO 9001:2015, ISO 14001:2015"
                  value={field.state.value}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple certifications with commas.
                </p>
                <FieldErrors
                  errors={field.state.meta.errors}
                  visible={attemptedSubmit || field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
        </div>
        </FormSection>

        <FormSection
          description="Registered office and correspondence location"
          icon={MapPinIcon}
          title="Address"
        >
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="address.line1">
            {(field) => (
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor={field.name}>Address Line 1</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  autoComplete="address-line1"
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
                <FieldErrors
                  errors={field.state.meta.errors}
                  visible={attemptedSubmit || field.state.meta.isTouched}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="address.line2">
            {(field) => (
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor={field.name}>Address Line 2 (optional)</Label>
                <Input
                  autoComplete="address-line2"
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>
          {(
            [
              ["address.city", "City", "address-level2"],
              ["address.state", "State", "address-level1"],
              ["address.postalCode", "PIN Code", "postal-code"],
              ["address.country", "Country", "country-name"],
            ] as const
          ).map(([name, label, autoComplete]) => (
            <form.Field key={name} name={name}>
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>{label}</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    autoComplete={autoComplete}
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    value={field.state.value}
                  />
                  <FieldErrors
                    errors={field.state.meta.errors}
                    visible={attemptedSubmit || field.state.meta.isTouched}
                  />
                </div>
              )}
            </form.Field>
          ))}
        </div>
        </FormSection>

        <FormSection
          description="Primary person responsible for vendor communication"
          icon={UserRoundIcon}
          title="Contact details"
        >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["contactDetails.name", "Contact Person", "name"],
              ["contactDetails.designation", "Designation", "organization-title"],
              ["contactDetails.email", "Email", "email"],
              ["contactDetails.phone", "Phone", "tel"],
            ] as const
          ).map(([name, label, autoComplete]) => (
            <form.Field key={name} name={name}>
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>{label}</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    autoComplete={autoComplete}
                    id={field.name}
                    inputMode={name.endsWith("phone") ? "numeric" : undefined}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    type={name.endsWith("email") ? "email" : "text"}
                    value={field.state.value}
                  />
                  <FieldErrors
                    errors={field.state.meta.errors}
                    visible={attemptedSubmit || field.state.meta.isTouched}
                  />
                </div>
              )}
            </form.Field>
          ))}
        </div>
        </FormSection>

        <FormSection
          description="Account information used for vendor payments"
          icon={LandmarkIcon}
          title="Bank details"
        >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["bankDetails.accountName", "Account Holder Name"],
              ["bankDetails.bankName", "Bank Name"],
              ["bankDetails.accountNumber", "Account Number"],
              ["bankDetails.ifscCode", "IFSC Code"],
            ] as const
          ).map(([name, label]) => (
            <form.Field key={name} name={name}>
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>{label}</Label>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    className={name.endsWith("ifscCode") ? "uppercase" : undefined}
                    id={field.name}
                    inputMode={name.endsWith("accountNumber") ? "numeric" : undefined}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(
                        name.endsWith("ifscCode")
                          ? event.target.value.toUpperCase()
                          : event.target.value
                      )
                    }
                    value={field.state.value}
                  />
                  <FieldErrors
                    errors={field.state.meta.errors}
                    visible={attemptedSubmit || field.state.meta.isTouched}
                  />
                </div>
              )}
            </form.Field>
          ))}
        </div>
        </FormSection>

        <FormSection
          description="Upload up to five PDF, JPG or PNG files, maximum 5 MB each"
          icon={FileCheck2Icon}
          title="Documents upload"
        >
        <form.Field name="documents">
          {(field) => (
            <div className="grid gap-3">
              <Label
                className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center hover:bg-muted/50"
                htmlFor="vendor-documents"
              >
                <PaperclipIcon className="size-5 text-muted-foreground" />
                <span className="font-medium">Choose supporting documents</span>
                <span className="text-xs font-normal text-muted-foreground">
                  GST, PAN, bank proof or certifications
                </span>
              </Label>
              <Input
                accept={ACCEPTED_FILE_TYPES.join(",")}
                className="sr-only"
                id="vendor-documents"
                multiple
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? [])
                  const documents: VendorUpload[] = files.map((file) => ({
                    lastModified: file.lastModified,
                    name: file.name,
                    size: file.size,
                    type: file.type as VendorUpload["type"],
                  }))

                  field.handleChange(documents)
                }}
                type="file"
              />
              {field.state.value.length > 0 ? (
                <div className="grid gap-2">
                  {field.state.value.map((document, index) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                      key={`${document.name}-${document.lastModified}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{document.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(document.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        aria-label={`Remove ${document.name}`}
                        onClick={() =>
                          field.handleChange(
                            field.state.value.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <XIcon />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
              <FieldErrors
                errors={field.state.meta.errors}
                visible={attemptedSubmit || field.state.meta.isTouched}
              />
            </div>
          )}
        </form.Field>
        </FormSection>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                disabled={!canSubmit || isSubmitting || createVendorMutation.isPending}
                type="submit"
              >
                {isSubmitting || createVendorMutation.isPending ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : null}
                {isSubmitting || createVendorMutation.isPending
                  ? "Creating vendor"
                  : "Create Vendor"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
