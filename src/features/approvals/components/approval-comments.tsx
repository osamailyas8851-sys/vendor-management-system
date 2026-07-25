import { useForm } from "@tanstack/react-form"
import { LoaderCircleIcon, MessageSquareIcon, SendIcon } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useAddApprovalCommentMutation } from "@/features/approvals/api/approvals.queries"
import type { ApprovalComment } from "@/features/approvals/types"

const commentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, "Enter a comment containing at least 2 characters.")
    .max(1000, "Keep the comment under 1,000 characters."),
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  year: "numeric",
})

export function ApprovalComments({
  comments,
  vendorId,
}: {
  comments: ApprovalComment[]
  vendorId: string
}) {
  const mutation = useAddApprovalCommentMutation(vendorId)
  const form = useForm({
    defaultValues: { message: "" },
    validators: { onSubmit: commentSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ message: value.message.trim() })
      form.reset()
      toast.add({
        description: "Your note was added to the approval record.",
        title: "Comment added",
        type: "success",
      })
    },
  })

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Comments</CardTitle>
        <CardDescription>
          Internal reviewer notes and decision context
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <form
          className="grid gap-3"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          {mutation.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Comment could not be added</AlertTitle>
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          ) : null}
          <form.Field name="message">
            {(field) => {
              const messages = Array.from(
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
                  <Label htmlFor="approval-comment">Add a comment</Label>
                  <Textarea
                    aria-invalid={messages.length > 0}
                    id="approval-comment"
                    maxLength={1000}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Add context for other reviewers…"
                    rows={3}
                    value={field.state.value}
                  />
                  {messages.map((message) => (
                    <p className="text-xs text-destructive" key={message}>
                      {message}
                    </p>
                  ))}
                </div>
              )
            }}
          </form.Field>
          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.values.message,
            ] as const}
          >
            {([canSubmit, isSubmitting, message]) => (
              <Button
                className="w-fit"
                disabled={
                  !canSubmit ||
                  !String(message).trim() ||
                  isSubmitting ||
                  mutation.isPending
                }
                type="submit"
              >
                {isSubmitting || mutation.isPending ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <SendIcon />
                )}
                {isSubmitting || mutation.isPending
                  ? "Adding comment"
                  : "Add Comment"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="grid gap-4 border-t pt-5">
          {comments.length ? (
            comments.map((comment) => (
              <article className="flex gap-3" key={comment.id}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {comment.author
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1 rounded-lg bg-muted/60 p-3">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div>
                      <span className="font-medium">{comment.author}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {comment.authorRole}
                      </span>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {dateTimeFormatter.format(new Date(comment.createdAt))}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {comment.message}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <MessageSquareIcon className="size-4" />
              No comments have been added to this approval.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
