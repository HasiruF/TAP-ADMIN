'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ModerationItem = {
  id: string
  userId: string
  name: string
  type: string
  date: string
  role: string
}

interface Props {
  data: ModerationItem[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onRowClick: (item: ModerationItem) => void
}

export function ModerationQueueTable({
  data,
  onApprove,
  onReject,

  onRowClick,
}: Props) {
  const [roleFilter, setRoleFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredData = data.filter((item) => {
    const matchesRole = roleFilter === 'all' ? true : item.role === roleFilter

    const matchesType = typeFilter === 'all' ? true : item.type === typeFilter

    return matchesRole && matchesType
  })

  return (
    <div
      className="rounded-[32px] border overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* FILTER BAR */}
      <div
        className="p-6 border-b flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5"
        style={{
          borderColor: 'var(--border)',
        }}
      >
        {/* ROLE FILTER */}
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

        {/* TYPE FILTER */}
        <div className="w-[60px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger
              style={{
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: 'var(--border)' }}>
            <TableHead className="text-center">User ID</TableHead>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onRowClick(item)}
              className="cursor-pointer"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* USER ID */}
              <TableCell
                className="text-center"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {item.userId}
              </TableCell>

              {/* NAME */}
              <TableCell
                className="text-center"
                style={{ color: 'var(--foreground)', fontWeight: 500 }}
              >
                {item.name}
              </TableCell>

              {/* TYPE */}
              <TableCell className="text-center">
                <span
                  className="px-3 py-1 rounded-full text-xs capitalize"
                  style={{
                    backgroundColor: 'rgba(201,168,76,0.1)',
                    color: 'var(--gold)',
                  }}
                >
                  {item.type.replace('-', ' ')}
                </span>
              </TableCell>

              {/* DATE */}
              <TableCell
                className="text-center"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {item.date}
              </TableCell>

              {/* ACTIONS */}
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: 'var(--status-active-bg)',
                      color: 'var(--status-active-text)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onApprove(item.id)
                    }}
                  >
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    style={{
                      backgroundColor: 'var(--status-banned-bg)',
                      color: 'var(--status-banned-text)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onReject(item.id)
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
