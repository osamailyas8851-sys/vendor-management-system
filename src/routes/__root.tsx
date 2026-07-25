import { createRootRoute, Outlet } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <main className="grid min-h-svh place-items-center p-6 text-center">
      <div>
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 font-heading text-2xl font-medium">
          Page not found
        </h1>
      </div>
    </main>
  ),
})

function RootLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--header-height": "3.5rem",
          "--sidebar-width": "17rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
