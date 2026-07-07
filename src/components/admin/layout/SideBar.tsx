'use client'
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
} from '@/components/ui/sidebar'
import { useAuthContext } from '@/lib/api/auth/AuthContext'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  BadgeCheck,
  Settings,
  MessageSquare,
  LogOut,
  BookOpen,
  ScrollText,
} from 'lucide-react'
const navMain = [
  {
    title: 'Overview',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Content Moderation',
    url: '/admin/moderation',
    icon: ShieldAlert,
  },
  {
    title: 'Resources',
    url: '/admin/resources',
    icon: BookOpen,
  },
  {
    title: 'Activity Logs',
    url: '/admin/log',
    icon: ScrollText,
  },
  {
    title: 'Message Moderation',
    url: '/admin/messages',
    icon: MessageSquare,
    disabled: true,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const { logout } = useAuthContext()
  const queryClient = useQueryClient()
  const router = useRouter()
  const handleLogout = async () => {
    try {
      await logout()

      queryClient.removeQueries({ queryKey: ['me'] })

      router.push('/login')
    } catch (err) {
      queryClient.removeQueries({ queryKey: ['me'] })

      router.push('/login')
    }
  }
  return (
    <Sidebar
      collapsible="icon"
      style={{
        backgroundColor: 'var(--background)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* HEADER */}
      <SidebarHeader>
        <div
          className={`flex items-center px-4 py-4 transition-all ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {/* LOGO + TEXT*/}
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border"
                style={{
                  backgroundColor: 'var(--sidebar-accent)',
                  borderColor: 'var(--sidebar-border)',
                }}
              >
                <img
                  src="/Primary.svg"
                  alt="TAP Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>

              <div>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--foreground)',
                    fontSize: '18px',
                    letterSpacing: '0.12em',
                    lineHeight: 1,
                  }}
                >
                  TAP ADMIN
                </h1>
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
              color: 'var(--muted-foreground)',
              letterSpacing: '0.14em',
              fontSize: '10px',
            }}
          >
            MANAGEMENT
          </SidebarGroupLabel>

          <SidebarMenu>
            {navMain.map((item) => {
              const isActive = pathname === item.url
              const isDisabled = item.disabled

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    style={{
                      color: isActive
                        ? 'var(--primary-foreground)'
                        : 'var(--foreground)',
                      backgroundColor: isActive
                        ? 'var(--foreground)'
                        : 'transparent',
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : undefined,
                    }}
                    className={`
                      transition-all
                      rounded-2xl
                      ${
                        isDisabled
                          ? ''
                          : 'hover:translate-x-[2px] hover:bg-[rgba(255,255,255,0.04)]'
                      }
                      `}
                  >
                    {isDisabled ? (
                      <div
                        aria-disabled="true"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-not-allowed
                           ${isCollapsed ? 'justify-center' : ''}`}
                      >
                        <item.icon size={24} style={{ color: 'var(--gold)' }} />

                        <span
                          className={
                            isCollapsed ? 'hidden' : 'text-[15px] font-medium'
                          }
                        >
                          {item.title}
                        </span>
                      </div>
                    ) : (
                      <a
                        href={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl
                           ${isCollapsed ? 'justify-center' : ''}`}
                      >
                        <item.icon
                          size={24}
                          style={{
                            color: isActive ? 'var(--gold)' : 'var(--gold)',
                          }}
                        />

                        <span
                          className={
                            isCollapsed ? 'hidden' : 'text-[15px] font-medium'
                          }
                        >
                          {item.title}
                        </span>
                      </a>
                    )}
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
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl cursor-pointer transition-all hover:translate-x-[2px] hover:bg-[rgba(255,255,255,0.06)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            style={{ color: 'var(--foreground)' }}
          >
            <LogOut size={18} style={{ color: 'var(--muted-foreground)' }} />
            <span
              className={`text-sm font-medium ${isCollapsed ? 'hidden' : ''}`}
            >
              Logout
            </span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
