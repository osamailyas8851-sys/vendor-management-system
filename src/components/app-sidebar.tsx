import { Link, useRouterState } from "@tanstack/react-router"
import {
  BellIcon,
  ChartNoAxesCombinedIcon,
  CircleHelpIcon,
  ClipboardCheckIcon,
  LayoutDashboardIcon,
  PackageCheckIcon,
  Settings2Icon,
  UsersRoundIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { useNotificationsQuery } from "@/features/notifications/api/notifications.queries"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const mainNavigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    to: "/" as const,
  },
  {
    title: "Vendors",
    icon: UsersRoundIcon,
    to: "/vendors" as const,
  },
  {
    title: "Performance",
    icon: ChartNoAxesCombinedIcon,
    to: "/performance" as const,
  },
  {
    title: "Approvals",
    icon: ClipboardCheckIcon,
    to: "/approvals" as const,
  },
  {
    title: "Notifications",
    icon: BellIcon,
    to: "/notifications" as const,
  },
]

const secondaryNavigation = [
  { title: "Settings", icon: Settings2Icon },
  { title: "Help and support", icon: CircleHelpIcon },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const notificationsQuery = useNotificationsQuery()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-10 px-2"
              render={<Link to="/" />}
              size="lg"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PackageCheckIcon className="size-4" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-heading font-medium">
                  FieldNerve
                </span>
                <span className="truncate text-xs text-sidebar-foreground/65">
                  Vendor intelligence
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={
                      item.to === "/"
                        ? pathname === item.to
                        : pathname.startsWith(item.to)
                    }
                    render={<Link to={item.to} />}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.to === "/notifications" &&
                  notificationsQuery.data?.unread ? (
                    <SidebarMenuBadge>
                      {notificationsQuery.data.unread > 99
                        ? "99+"
                        : notificationsQuery.data.unread}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled tooltip={item.title}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: "Ananya Rao",
            email: "Procurement Manager",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
