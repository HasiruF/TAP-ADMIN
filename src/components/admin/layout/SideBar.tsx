"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  BadgeCheck,
  Settings,
  LogOut,
} from "lucide-react"
const navMain = [
  {
    title: "Overview",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Content Moderation",
    url: "/admin/moderation",
    icon: ShieldAlert,
  },
  {
    title: "User Approvals",
    url: "/admin/approvals",
    icon: BadgeCheck,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  return (
    <Sidebar collapsible="icon"
      style={{
        backgroundColor: "var(--background)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* HEADER */}
      <SidebarHeader>
        <div
          className={`flex items-center px-4 py-4 transition-all ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {/* LOGO + TEXT*/}
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border"
                style={{
                  backgroundColor: "var(--sidebar-accent)",
                  borderColor: "var(--sidebar-border)",
                }}
              >
                <img
                  src="/primary.svg"
                  alt="TAP Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>

              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--foreground)",
                    fontSize: "24px",
                    letterSpacing: "0.12em",
                    lineHeight: 1,
                  }}
                >
                  TAP ADMIN
                </h1>

                <p
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Control Center
                </p>
              </div>
            </div>
          )}

          {/* ALWAYS visible trigger */}
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      {/* MAIN NAV */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            style={{
              color: "var(--muted-foreground)",
              letterSpacing: "0.14em",
              fontSize: "10px",
            }}
          >
            MANAGEMENT
          </SidebarGroupLabel>

          <SidebarMenu>
            {navMain.map((item) => {
              const isActive = pathname === item.url

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    style={{
                      color: isActive
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                      backgroundColor: isActive
                        ? "var(--foreground)"
                        : "transparent",
                    }}
                    className="
                      transition-all
                      rounded-2xl
                      hover:translate-x-[2px]
                      hover:bg-[rgba(255,255,255,0.04)]
                      "
                  >
                    <a
                      href={item.url}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl
                         ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <item.icon
                        size={24}
                        style={{
                          color: isActive
                            ? "var(--gold)"
                            : "var(--gold)",
                        }}
                      />

                      <span className={isCollapsed ? "hidden" : "text-[15px] font-medium"}>
                        {item.title}
                      </span>     
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>


      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition"
            style={{ color: "var(--foreground)" }}
          >
            <LogOut size={18} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}