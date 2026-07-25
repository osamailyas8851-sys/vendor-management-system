import * as React from "react"
import { useForm } from "@tanstack/react-form"
import {
  CheckIcon,
  LoaderCircleIcon,
  MessageSquareWarningIcon,
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useApprovalActionMutation } from "@/features/approvals/api/approvals.queries"
import type { ApprovalDecision } from "@/features/approvals/types"

const actionConfig = {
  approve: {
    description:
      "This vendor will become active and can be used for purchasing transactions.",
    icon: CheckIcon,
    label: "Approve",
    placeholder: "Add an optional approval note…",
    success: "Vendor approved",
    title: "Approve vendor?",
    variant: "default" as const,
  },
  reject: {
    description:
      "This is a final decision for the current submission. A rejection reason is required.",
    icon: XIcon,
    label: "Reject",
    placeholder: "Explain why this vendor is being rejected…",
    success: "Vendor rejected",
    title: "Reject vendor?",
    variant: "destructive" as const,
  },
  request_changes: {
    description:
      "The approval will be placed on hold until the requested information is updated.",
    icon: MessageSquareWarningIcon,
    label: "Request Changes",
    placeholder: "Describe the information or documents that must be updated…",
    success: "Changes requested",
    title: "Request vendor changes?",
    variant: "outline" as const,
  },
}

export function ApprovalActionDialog({
  action,
  vendorId,
  vendorName,
}: {
  action: ApprovalDecision
  vendorId: string
  vendorName: string
}) {
  const [open, setOpen] = React.useState(false)
  const config = actionConfig[action]
  const mutation = useApprovalActionMutation(vendorId)
  const commentSchema = React.useMemo(
    () =>
      z.object({
        comment:
          action === "approve"
            ? z.string().trim().max(1000, "Keep the note under 1,000 characters.")
            : z
                .string()
                .trim()
                .min(3, "Enter a reason containing at least 3 characters.")
                .max(1000, "Keep the reason under 1,000 characters."),
      }),
    [action]
  )
  const form = useForm({
    defaultValues: { comment: "" },
    validators: { onSubmit: commentSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        action,
        comment: value.comment.trim() || undefined,
      })
      toast.add({
        description: `${vendorName} has been updated successfully.`,
        title: config.success,
        type: "success",
      })
      form.reset()
      setOpen(false)
    },
  })
  const Icon = config.icon

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !mutation.isPending) {
      form.reset()
      mutation.reset()
    }
    setOpen(nextOpen)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger
        render={
          <Button className="w-full justify-center" variant={config.variant} />
        }
      >
        <Icon />
        {config.label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          className="grid gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          {mutation.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Decision could not be saved</AlertTitle>
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          ) : null}

          <form.Field name="comment">
            {(field) => {
              const errorMessages = Array.from(
                new Set(
                  field.state.meta.errors.map((error) =>
                    typeof error === "string"
                      ? error
                      : error && typeof error === "object" && "message" in error
                        ? String(error.message)
                        : "Enter a valid comment."
                  )
                )
              )

              return (
                <div className="grid gap-2">
                  <Label htmlFor={`approval-${action}-comment`}>
                    {action === "approve" ? "Comment (optional)" : "Reason"}
                  </Label>
                  <Textarea
                    aria-invalid={errorMessages.length > 0}
                    id={`approval-${action}-comment`}
                    maxLength={1000}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder={config.placeholder}
                    rows={5}
                    value={field.state.value}
                  />
                  {errorMessages.map((message) => (
                    <p className="text-xs text-destructive" key={message}>
                      {message}
                    </p>
                  ))}
                </div>
              )
            }}
          </form.Field>

          <DialogFooter>
            <DialogClose
              disabled={mutation.isPending}
              render={<Button type="button" variant="outline" />}
            >
              Cancel
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  disabled={!canSubmit || isSubmitting || mutation.isPending}
                  type="submit"
                  variant={config.variant}
                >
                  {isSubmitting || mutation.isPending ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <Icon />
                  )}
                  {isSubmitting || mutation.isPending
                    ? "Saving decision"
                    : config.label}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
