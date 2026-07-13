// src/components/admin/users/UserManagementTable.tsx

'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getAdminUserRoute } from '@/utils/AdminRoutes'
import { getAdminLogRoute } from '@/utils/AdminRoutes'
import {
  Ban,
  ShieldMinus,
  ShieldCheck,
  Check,
  Eye,
  ScrollText,
  KeyRound,
  Unlock,
} from 'lucide-react'
import { MoreVertical } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { User } from '@/types/user'
import { Button } from '@/components/ui/button'
import { useAdminUsers } from '@/hooks/queries/useAdminUsers'
import { useRouter } from 'next/navigation'
import { mapUserToBe } from '@/types/user'
import { useQueryClient } from '@tanstack/react-query'
import {
  suspendUser,
  unsuspendUser,
  banUser,
  unlockUser,
} from '@/lib/api/admin/users'
import { approveArtist } from '@/lib/api/admin/artists'
import { approveVenue } from '@/lib/api/admin/venues'
import { forgotPassword } from '@/lib/api/auth'
import { ReasonPromptDialog } from '@/components/admin/shared/ReasonPromptDialog'

function getStatusStyles(status: string) {
  switch (status) {
    case 'Active':
      return {
        backgroundColor: 'var(--status-active-bg)',
        color: 'var(--status-active-text)',
      }

    case 'Not-approved':
      return {
        backgroundColor: 'var(--status-pending-bg)',
        color: 'var(--status-pending-text)',
      }

    case 'Suspended':
      return {
        backgroundColor: 'var(--status-suspended-bg)',
        color: 'var(--status-suspended-text)',
      }

    case 'Banned':
      return {
        backgroundColor: 'var(--status-banned-bg)',
        color: 'var(--status-banned-text)',
      }
    case 'Locked':
      return {
        backgroundColor: 'var(--status-locked-bg)',
        color: 'var(--status-locked-text)',
      }
    case 'Inactive':
      return {
        backgroundColor: 'var(--status-pending-bg)',
        color: 'var(--status-pending-text)',
      }
  }
}

const filterOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Email', value: 'email' },
  { label: 'Joined Date', value: 'joined' },
  { label: 'Last Login Date', value: 'lastlogin' },
]

function formatDate(date?: string | null) {
  if (!date) return '-'

  const parsed = new Date(date)

  if (isNaN(parsed.getTime())) return '-'

  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parsed)
}

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Not Approved', value: 'not-approved' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Locked', value: 'locked' },
  { label: 'Banned', value: 'banned' },
]

// Persist the User Management filters across navigation (e.g. going into a
// user/venue detail page and coming back) using sessionStorage.
const FILTERS_STORAGE_KEY = 'user-management-filters'

type StoredFilters = {
  search: string
  filter: string
  roleFilter: string
  statusFilter: string
  currentPage: number
}

function loadStoredFilters(): Partial<StoredFilters> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(FILTERS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<StoredFilters>) : {}
  } catch {
    return {}
  }
}

export function UserManagementTable() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState(() => loadStoredFilters().search ?? '')
  const [filter, setFilter] = useState(
    () => loadStoredFilters().filter ?? 'name'
  )
  const [roleFilter, setRoleFilter] = useState(
    () => loadStoredFilters().roleFilter ?? 'artist'
  )
  const [statusFilter, setStatusFilter] = useState(
    () => loadStoredFilters().statusFilter ?? 'all'
  )
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null)
  const [banTarget, setBanTarget] = useState<User | null>(null)

  const [currentPage, setCurrentPage] = useState(
    () => loadStoredFilters().currentPage ?? 1
  )

  // Persist filters whenever they change so they survive remounts.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({
          search,
          filter,
          roleFilter,
          statusFilter,
          currentPage,
        })
      )
    } catch {
      /* ignore persistence errors */
    }
  }, [search, filter, roleFilter, statusFilter, currentPage])

  // Role filter is passed to the backend so pagination reflects the correct role
  const { data, isLoading, error } = useAdminUsers(currentPage, roleFilter)

  const usersBe = data?.data ?? []
  const hasNextPage = data?.hasNextPage ?? false
  const users = usersBe.map(mapUserToBe)

  if (isLoading) return <div className="p-6">Loading users...</div>
  if (error)
    return (
      <div className="p-6 text-red-500">
        Failed to load users. Please refresh the page or try again shortly.
      </div>
    )

  // Client-side filters: search + status only (role is already handled server-side)
  const filteredUsers = users.filter((user: User) => {
    const value = search.toLowerCase()
    let matchesSearch = true
    if (value) {
      switch (filter) {
        case 'name':
          matchesSearch = user.name.toLowerCase().includes(value)
          break
        case 'email':
          matchesSearch = user.email.toLowerCase().includes(value)
          break
        case 'id':
          matchesSearch = String(user.id).toLowerCase().includes(value)
          break
        case 'joined':
          matchesSearch = formatDate(user.joined).toLowerCase().includes(value)
          break
        case 'lastlogin':
          matchesSearch = formatDate(user.lastLogin)
            .toLowerCase()
            .includes(value)
          break
      }
    }
    const matchesStatus =
      statusFilter === 'all' ||
      user.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const totalPages = hasNextPage ? currentPage + 1 : currentPage

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })

  async function handleConfirmSuspend(reason: string) {
    if (!suspendTarget) return
    const userId = suspendTarget.id
    setActionBusy(userId)
    try {
      await suspendUser(userId, reason)
      await invalidateUsers()
    } catch {
      toast.error("We couldn't suspend this user. Please try again.")
    } finally {
      setActionBusy(null)
      setSuspendTarget(null)
    }
  }

  async function handleUnsuspend(userId: string) {
    setActionBusy(userId)
    try {
      await unsuspendUser(userId)
      await invalidateUsers()
    } catch {
      toast.error("We couldn't unsuspend this user. Please try again.")
    } finally {
      setActionBusy(null)
    }
  }

  async function handleUnlock(userId: string) {
    setActionBusy(userId)
    try {
      await unlockUser(userId)
      await invalidateUsers()
    } catch {
      toast.error("We couldn't unlock this account. Please try again.")
    } finally {
      setActionBusy(null)
    }
  }

  async function handleConfirmBan(reason: string) {
    if (!banTarget) return
    const userId = banTarget.id
    setActionBusy(userId)
    try {
      await banUser(userId, reason)
      await invalidateUsers()
    } catch {
      toast.error("We couldn't ban this user. Please try again.")
    } finally {
      setActionBusy(null)
      setBanTarget(null)
    }
  }

  async function handleApprove(user: User) {
    setActionBusy(user.id)
    try {
      if (user.role.toLowerCase() === 'venue') {
        await approveVenue(user.id)
      } else {
        await approveArtist(user.id)
      }
      await invalidateUsers()
    } catch {
      toast.error("We couldn't approve this user. Please try again.")
    } finally {
      setActionBusy(null)
    }
  }

  async function handleResetPassword(user: User) {
    const label = user.name?.trim() || user.email || user.id
    const confirmed = window.confirm(
      `Send a password reset email to ${label} (${user.email})?`
    )
    if (!confirmed) return
    setActionBusy(user.id)
    try {
      await forgotPassword(user.email)
      window.alert(`Password reset email sent to ${user.email}.`)
    } catch {
      window.alert('Failed to send password reset email. Please try again.')
    } finally {
      setActionBusy(null)
    }
  }

  function renderActionItems(user: User) {
    const busy = actionBusy === user.id
    switch (user.status) {
      case 'Not-approved':
        return (
          <>
            <DropdownMenuItem
              disabled={busy}
              onClick={() => handleApprove(user)}
            >
              <Check size={14} />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(getAdminUserRoute(user))}
            >
              <Eye size={14} />
              Review
            </DropdownMenuItem>
          </>
        )
      case 'Active':
        return (
          <>
            <DropdownMenuItem
              disabled={busy}
              onClick={() => setSuspendTarget(user)}
            >
              <ShieldMinus size={14} />
              Suspend
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={busy}
              onClick={() => setBanTarget(user)}
            >
              <Ban size={14} />
              Ban
            </DropdownMenuItem>
          </>
        )
      case 'Suspended':
        return (
          <DropdownMenuItem
            disabled={busy}
            onClick={() => handleUnsuspend(user.id)}
          >
            <ShieldCheck size={14} />
            Unsuspend
          </DropdownMenuItem>
        )
      case 'Locked':
        return (
          <DropdownMenuItem
            disabled={busy}
            onClick={() => handleUnlock(user.id)}
          >
            <Unlock size={14} />
            Unlock
          </DropdownMenuItem>
        )
      case 'Inactive':
      case 'Banned':
        return (
          <DropdownMenuItem
            onClick={() => router.push(getAdminUserRoute(user))}
          >
            <Eye size={14} />
            View
          </DropdownMenuItem>
        )
      default:
        return null
    }
  }

  function renderActions(user: User) {
    const actionItems = renderActionItems(user)
    const busy = actionBusy === user.id
    const canResetPassword = user.status !== 'Banned'
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition"
          >
            <MoreVertical size={18} style={{ color: 'var(--foreground)' }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {actionItems}
          {actionItems && <DropdownMenuSeparator />}
          {canResetPassword && (
            <DropdownMenuItem
              disabled={busy}
              onClick={() => handleResetPassword(user)}
            >
              <KeyRound size={14} />
              Reset Password
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push(getAdminLogRoute(user))}>
            <ScrollText size={14} />
            Activity Logs
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div
      className="rounded-[32px] border overflow-hidden"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* SEARCH & FILTERS */}
      <div
        className="p-6 border-b flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* LEFT */}
        <div className="flex flex-wrap items-center gap-3">
          {/* SEARCH TYPE */}
          <div className="w-[170px]">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger
                className="h-11"
                style={{
                  backgroundColor: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  borderRadius: '16px',
                }}
              >
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SEARCH INPUT */}
          <div className="w-[280px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search by ${filter}`}
              className="w-full h-11 px-4 rounded-2xl outline-none"
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          {/* STATUS FILTER */}
          <div className="w-[190px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="h-11"
                style={{
                  backgroundColor: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  borderRadius: '16px',
                }}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* RIGHT — ROLE TOGGLE */}
        <div className="flex items-center gap-3">
          <Button
            className="h-11 px-5 rounded-full"
            variant={roleFilter === 'artist' ? 'default' : 'outline'}
            onClick={() => {
              setRoleFilter('artist')
              setCurrentPage(1)
            }}
            style={
              roleFilter === 'artist'
                ? {
                    backgroundColor: 'var(--chart-artists)',
                    color: 'var(--primary-foreground)',
                    borderRadius: '999px',
                  }
                : {}
            }
          >
            Artists
          </Button>
          <Button
            className="h-11 px-5 rounded-full"
            variant={roleFilter === 'venue' ? 'default' : 'outline'}
            onClick={() => {
              setRoleFilter('venue')
              setCurrentPage(1)
            }}
            style={
              roleFilter === 'venue'
                ? {
                    backgroundColor: 'var(--chart-venues)',
                    color: 'var(--primary-foreground)',
                    borderRadius: '999px',
                  }
                : {}
            }
          >
            Venues
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Table className="table-fixed">
        <TableHeader>
          <TableRow style={{ borderColor: 'var(--border)' }}>
            <TableHead className="text-center w-[18%]">Name</TableHead>
            <TableHead className="text-center w-[22%]">Email</TableHead>
            <TableHead className="text-center w-[15%]">Joined Date</TableHead>
            <TableHead className="text-center w-[15%]">
              Last Login Date
            </TableHead>
            <TableHead className="text-center w-[10%]">Status</TableHead>
            <TableHead className="text-center w-[10%]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredUsers.map((user: User) => (
            <TableRow
              key={user.id}
              className="transition-colors cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--table-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              onClick={() => router.push(getAdminUserRoute(user))}
            >
              <TableCell className="text-center break-words whitespace-normal">
                <p style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                  {user.name}
                </p>
              </TableCell>
              <TableCell
                className="text-center break-words whitespace-normal"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {user.email}
              </TableCell>
              <TableCell
                className="text-center break-words whitespace-normal"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {formatDate(user.joined)}
              </TableCell>
              <TableCell
                className="text-center break-words whitespace-normal"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {formatDate(user.lastLogin)}
              </TableCell>

              {/* STATUS BADGE */}
              <TableCell className="text-center">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs capitalize"
                  style={getStatusStyles(user.status)}
                >
                  {user.status.replace('-', ' ')}
                </div>
              </TableCell>

              {/* ACTIONS */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  {renderActions(user)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Showing{' '}
          <span style={{ color: 'var(--foreground)' }}>
            {filteredUsers.length}
          </span>{' '}
          users on page{' '}
          <span style={{ color: 'var(--foreground)' }}>{currentPage}</span>
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1
            return (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
                style={
                  currentPage === page
                    ? {
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                      }
                    : {}
                }
              >
                {page}
              </Button>
            )
          })}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>

      <ReasonPromptDialog
        open={suspendTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSuspendTarget(null)
        }}
        onConfirm={handleConfirmSuspend}
        eyebrow="Admin • User Management"
        title={`Suspend ${suspendTarget?.name?.trim() || suspendTarget?.email || 'user'}`}
        description="This will block the account from logging in. The reason is emailed to the user."
        confirmLabel="Confirm Suspension"
        confirmingLabel="Suspending..."
        confirmColor={{
          backgroundColor: 'var(--status-suspended-bg)',
          color: 'var(--status-suspended-text)',
        }}
        isSubmitting={actionBusy === suspendTarget?.id}
      />

      <ReasonPromptDialog
        open={banTarget !== null}
        onOpenChange={(open) => {
          if (!open) setBanTarget(null)
        }}
        onConfirm={handleConfirmBan}
        eyebrow="Admin • User Management"
        title={`Ban ${banTarget?.name?.trim() || banTarget?.email || 'user'}`}
        description="This permanently removes the account and blocks the email from ever registering again. This cannot be undone. The reason is emailed to the user."
        confirmLabel="Confirm Ban"
        confirmingLabel="Banning..."
        confirmColor={{
          backgroundColor: 'var(--status-banned-bg)',
          color: 'var(--status-banned-text)',
        }}
        isSubmitting={actionBusy === banTarget?.id}
      />
    </div>
  )
}
