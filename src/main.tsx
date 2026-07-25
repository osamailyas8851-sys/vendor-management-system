import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"

import { queryClient } from "@/api/query-client"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { router } from "@/router"

import "@/index.css"

async function enableMocking() {
  const shouldMock = import.meta.env.VITE_ENABLE_MOCKS !== "false"

  if (!shouldMock) {
    return
  }

  const { worker } = await import("@/mocks/browser")
  await worker.start({
    onUnhandledRequest: "bypass",
  })
}

function renderApp() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

void enableMocking().then(renderApp)
