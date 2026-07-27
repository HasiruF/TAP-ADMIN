'use client'
import Image from 'next/image'
import Link from 'next/link'
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
  MessageSquare,
  LogOut,
  BookOpen,
  ScrollText,
  Store,
} from 'lucide-react'
const navMain: Array<{
  title: string
  url: string
  icon: typeof LayoutDashboard
  disabled?: boolean
}> = [
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
    title: 'Activity Logs',
    url: '/admin/log',
    icon: ScrollText,
  },
  {
    title: 'Message Moderation',
    url: '/admin/messages',
    icon: MessageSquare,
  },
]

const navMarketplace: Array<{
  title: string
  url: string
  icon: typeof LayoutDashboard
  disabled?: boolean
}> = [
  {
    title: 'Resources',
    url: '/admin/resources',
    icon: BookOpen,
  },
  {
    title: 'Products & Services',
    url: '/admin/vendors',
    icon: Store,
  },
]

function NavItem({
  item,
  isActive,
  isCollapsed,
}: {
  item: {
    title: string
    url: string
    icon: typeof LayoutDashboard
    disabled?: boolean
  }
  isActive: boolean
  isCollapsed: boolean
}) {
  const isDisabled = item.disabled

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        style={{
          color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
          backgroundColor: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : undefined,
          position: 'relative',
        }}
        className={`
          transition-all
          rounded-xl
          ${isDisabled ? '' : 'hover:translate-x-[2px] hover:bg-[rgba(255,255,255,0.04)]'}
          `}
      >
        {isDisabled ? (
          <div
            aria-disabled="true"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-not-allowed
               ${isCollapsed ? 'justify-center' : ''}`}
          >
            <item.icon
              size={19}
              strokeWidth={1.8}
              style={{ color: 'var(--muted-foreground)' }}
            />

            <span
              className={isCollapsed ? 'hidden' : 'text-[14px] font-medium'}
            >
              {item.title}
            </span>
          </div>
        ) : (
          <Link
            href={item.url}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl
               ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isActive && !isCollapsed && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: '3px',
                  height: '18px',
                  backgroundColor: 'var(--gold)',
                }}
              />
            )}
            <item.icon
              size={19}
              strokeWidth={1.8}
              style={{
                color: isActive ? 'var(--gold)' : 'var(--muted-foreground)',
              }}
            />

            <span
              className={isCollapsed ? 'hidden' : 'text-[14px] font-medium'}
            >
              {item.title}
            </span>
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

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
    } catch {
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
      <SidebarHeader style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className={`flex items-center px-4 py-5 transition-all ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {/* LOGO + TEXT*/}
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--sidebar-accent)',
                  borderColor: 'rgba(201,168,76,0.25)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 20%, rgba(201,168,76,0.35), transparent 70%)',
                  }}
                />
                <Image
                  src="/Primary.svg"
                  alt="TAP Logo"
                  width={44}
                  height={44}
                  className="w-11 h-11 object-contain relative"
                />
              </div>

              <div>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--foreground)',
                    fontSize: '17px',
                    letterSpacing: '0.14em',
                    lineHeight: 1,
                  }}
                >
                  TAP ADMIN
                </h1>
                <p
                  className="mt-1"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Control Panel
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
        <SidebarGroup className="pt-5">
          <SidebarGroupLabel
            style={{
              color: 'var(--muted-foreground)',
              letterSpacing: '0.14em',
              fontSize: '10px',
              marginBottom: '4px',
            }}
          >
            MANAGEMENT
          </SidebarGroupLabel>

          <SidebarMenu className="gap-1">
            {navMain.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                isActive={pathname === item.url}
                isCollapsed={isCollapsed}
              />
            ))}
          </SidebarMenu>

          {!isCollapsed && (
            <p
              className="px-4 mt-4 mb-1"
              style={{
                color: 'var(--muted-foreground)',
                letterSpacing: '0.14em',
                fontSize: '10px',
                opacity: 0.7,
              }}
            >
              MARKETPLACE
            </p>
          )}

          <SidebarMenu className="gap-1">
            {navMarketplace.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                isActive={pathname === item.url}
                isCollapsed={isCollapsed}
              />
            ))}
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
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:translate-x-[2px] hover:bg-[rgba(229,104,106,0.08)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 group ${
              isCollapsed ? 'justify-center' : ''
            }`}
            style={{ color: 'var(--muted-foreground)' }}
          >
            <LogOut
              size={18}
              strokeWidth={1.8}
              className="transition-colors group-hover:text-[var(--danger,#e5686a)]"
            />
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
