// src/components/admin/users/UserManagementTable.tsx

'use client'

import { useState } from 'react'
import { getAdminUserRoute } from '@/utils/AdminRoutes'
import { getAdminLogRoute } from '@/utils/AdminRoutes'
import { Check, Ban, ShieldMinus, ShieldCheck, X, Search } from 'lucide-react'
import { MoreVertical } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
import { Input } from '@/components/ui/input'
import { useAdminUsers } from '@/hooks/queries/useAdminUsers'
import { useRouter } from 'next/navigation'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { Label } from '@/components/ui/label'
import { label } from 'framer-motion/client'

type UserStatus = 'active' | 'not-approved' | 'suspended' | 'banned'

function getStatusStyles(status: UserStatus) {
  switch (status) {
    case 'active':
      return {
        backgroundColor: 'var(--status-active-bg)',
        color: 'var(--status-active-text)',
      }

    case 'not-approved':
      return {
        backgroundColor: 'var(--status-pending-bg)',
        color: 'var(--status-pending-text)',
      }

    case 'suspended':
      return {
        backgroundColor: 'var(--status-suspended-bg)',
        color: 'var(--status-suspended-text)',
      }

    case 'banned':
      return {
        backgroundColor: 'var(--status-banned-bg)',
        color: 'var(--status-banned-text)',
      }
  }
}

const filterOptions = [
  { label: 'Name', value: 'name' },
  { label: 'UserId', value: 'id' },
  { label: 'Email', value: 'email' },
  { label: 'Joined Date', value: 'joined' },
  { label: 'Last Login Date', value: 'lastlogin' },
]

function renderActions(status: UserStatus) {
  switch (status) {
    case 'active':
      return (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm">
            <ShieldMinus size={14} />
            Suspend
          </Button>
        </div>
      )

    case 'not-approved':
      return (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm">
            <Check size={14} />
            Approve
          </Button>

          <Button variant="destructive" size="sm">
            <X size={14} />
            Reject
          </Button>
        </div>
      )

    case 'suspended':
      return (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm">
            <ShieldCheck size={14} />
            Unsuspend
          </Button>
        </div>
      )

    case 'banned':
      return (
        <div className="flex justify-center">
          <Button size="sm">
            <ShieldCheck size={14} />
            Unban
          </Button>
        </div>
      )
  }
}
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Not Approved', value: 'not-approved' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
]

export function UserManagementTable() {
  const { data: users = [], isLoading, error } = useAdminUsers()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('name')
  const [roleFilter, setRoleFilter] = useState('artist')
  const [statusFilter, setStatusFilter] = useState('all')
  const ITEMS_PER_PAGE = 50

  const [currentPage, setCurrentPage] = useState(1)

  const router = useRouter()
  if (isLoading) {
    return <div className="p-6">Loading users...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to load users</div>
  }
  const filteredUsers = users.filter((user: User) => {
    const value = search.toLowerCase()

    // SEARCH FILTER
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
          matchesSearch = user.joined.toLowerCase().includes(value)
          break
        case 'lastlogin':
          matchesSearch = user.joined.toLowerCase().includes(value)
          break
      }
    }

    // ROLE FILTER
    const matchesRole = user.role === roleFilter

    // STATUS FILTER
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div
      className="rounded-[32px] border overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* SEARCH */}
      <div
        className="p-6 border-b flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5"
        style={{
          borderColor: 'var(--border)',
        }}
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

          {/* STATUS */}
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
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <Button
            className="h-11 px-5 rounded-full"
            variant={roleFilter === 'artist' ? 'default' : 'outline'}
            onClick={() => setRoleFilter('artist')}
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
            onClick={() => setRoleFilter('venue')}
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
      <Table>
        <TableHeader>
          <TableRow
            style={{
              borderColor: 'var(--border)',
            }}
          >
            <TableHead className="text-center w-[5%]">UserId</TableHead>
            <TableHead className="text-center w-[20%]">Name</TableHead>

            <TableHead className="text-center w-[20%]">Email</TableHead>

            <TableHead className="text-center w-[18%]">Joined Date</TableHead>

            <TableHead className="text-center w-[18%]">
              Last Login Date
            </TableHead>

            <TableHead className="text-center w-[15%]">Status</TableHead>

            <TableHead className="text-center w-[20%]">Actions</TableHead>

            <TableHead className="text-center w-[5%]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedUsers.map((user: User) => (
            <TableRow
              key={user.id}
              className="transition-colors"
              style={{
                borderColor: 'var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--table-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <TableCell
                className="text-center"
                onClick={() => router.push(getAdminUserRoute(user))}
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                {user.id}
              </TableCell>
              <TableCell
                className="text-center cursor-pointer"
                onClick={() => router.push(getAdminUserRoute(user))}
              >
                <p
                  style={{
                    color: 'var(--foreground)',
                    fontWeight: 500,
                  }}
                >
                  {user.name}
                </p>
              </TableCell>
              {/* EMAIL */}
              <TableCell
                className="text-center"
                onClick={() => router.push(getAdminUserRoute(user))}
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                {user.email}
              </TableCell>

              {/* DATE */}
              <TableCell
                className="text-center"
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                {user.joined}
              </TableCell>

              <TableCell
                className="text-center"
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                {user.lastlogin}
              </TableCell>

              {/* STATUS */}
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
                {renderActions(user.status)}
              </TableCell>
              <TableCell
                className="text-center"
                style={{
                  color: 'var(--muted-foreground)',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(getAdminLogRoute(user))
                  }}
                  className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition"
                >
                  <MoreVertical
                    size={18}
                    style={{ color: 'var(--foreground)' }}
                  />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5 border-t"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        {/* INFO */}
        <p
          className="text-sm"
          style={{
            color: 'var(--muted-foreground)',
          }}
        >
          Showing{' '}
          <span style={{ color: 'var(--foreground)' }}>
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}
          </span>
          –
          <span style={{ color: 'var(--foreground)' }}>
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
          </span>{' '}
          of{' '}
          <span style={{ color: 'var(--foreground)' }}>
            {filteredUsers.length}
          </span>
        </p>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          {/* PREVIOUS */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>

          {/* PAGE NUMBERS */}
          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1

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

          {/* NEXT */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
