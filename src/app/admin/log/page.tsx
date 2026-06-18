'use client'
import React, { Suspense, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useAdminLogs } from '@/hooks/queries/useAdminLogs'
import type { ActivityLog, EventType } from '@/types/logs'

// Visual treatment per event category. Falls back to the gold "other" style.
const EVENT_STYLES: Record<string, { bg: string; color: string }> = {
  'account-created': { bg: 'rgba(99,179,237,0.14)', color: '#63b3ed' },
  'go-live': { bg: 'rgba(159,122,234,0.16)', color: '#b794f4' },
  approval: {
    bg: 'var(--status-active-bg)',
    color: 'var(--status-active-text)',
  },
  rejection: {
    bg: 'var(--status-banned-bg)',
    color: 'var(--status-banned-text)',
  },
  'profile-picture': { bg: 'rgba(201,168,76,0.12)', color: 'var(--gold)' },
  'media-upload': { bg: 'rgba(72,187,120,0.14)', color: '#48bb78' },
  'media-delete': { bg: 'rgba(245,101,101,0.14)', color: '#f56565' },
  'media-accepted': {
    bg: 'var(--status-active-bg)',
    color: 'var(--status-active-text)',
  },
  'media-rejected': {
    bg: 'var(--status-banned-bg)',
    color: 'var(--status-banned-text)',
  },
  'password-reset': { bg: 'rgba(237,137,54,0.14)', color: '#ed8936' },
  suspension: {
    bg: 'var(--status-banned-bg)',
    color: 'var(--status-banned-text)',
  },
  'account-deleted': { bg: 'rgba(245,101,101,0.18)', color: '#f56565' },
  other: { bg: 'rgba(201,168,76,0.12)', color: 'var(--gold)' },
}

function eventStyle(event: EventType) {
  return EVENT_STYLES[event] ?? EVENT_STYLES.other
}

function LogsView() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') ?? undefined
  const name = searchParams.get('name') ?? undefined

  const { data: logs = [], isLoading, error } = useAdminLogs(userId)

  const [search, setSearch] = useState('')

  // Filter by email (actor or target), action/event, the change text, or name.
  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return logs
    return logs.filter((log) => {
      const haystack = [
        log.targetEmail,
        log.actorEmail,
        log.targetName,
        log.actorName,
        log.event,
        log.action,
        log.change,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [logs, search])

  if (isLoading) {
    return <div className="p-6">Loading logs...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to load logs</div>
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div
        className="p-6 rounded-3xl border"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Activity Logs
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '42px',
            color: 'var(--foreground)',
            lineHeight: 1.1,
            marginTop: '6px',
          }}
        >
          {name ?? (userId ? 'User Activity' : 'All Activity')}
        </h1>

        {userId && (
          <p
            style={{
              marginTop: '8px',
              color: 'var(--muted-foreground)',
              fontSize: '13px',
            }}
          >
            User ID:{' '}
            <span style={{ color: 'var(--foreground)' }}>{userId}</span>
          </p>
        )}

        {/* SEARCH */}
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 rounded-full border px-4 py-2 w-full max-w-md"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
            }}
          >
            <Search size={15} style={{ color: 'var(--muted-foreground)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, action or event…"
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: 'var(--foreground)' }}
            />
          </div>
          <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
            {filteredLogs.length} of {logs.length}
          </span>
        </div>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <table className="w-full text-sm">
          {/* HEADER */}
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="p-4 text-left w-[180px]">Date &amp; Time</th>
              <th className="p-4 text-left w-[240px]">Account</th>
              <th className="p-4 text-left w-[170px]">Event</th>
              <th className="p-4 text-left">Change</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {filteredLogs.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {search.trim()
                    ? 'No activity matches your search.'
                    : 'No activity recorded yet.'}
                </td>
              </tr>
            )}
            {filteredLogs.map((log: ActivityLog) => {
              const hasDiff = log.changeFrom || log.changeTo
              const style = eventStyle(log.event)

              // The account this entry is about (the target the action affected,
              // falling back to whoever performed it for self-actions).
              const accountName =
                log.targetName ?? log.actorName ?? 'Unknown user'
              const accountEmail = log.targetEmail ?? log.actorEmail ?? null

              // Show "by …" only when an admin acted on someone else's account.
              const actorIsDifferent =
                !!log.actorUserId &&
                !!log.targetId &&
                log.actorUserId !== log.targetId
              const byLabel = actorIsDifferent
                ? (log.actorName ??
                  (log.actorRole === 'admin' ? 'Admin' : 'Another user'))
                : null

              return (
                <React.Fragment key={log.id}>
                  {/* MAIN ROW */}
                  <tr
                    style={{
                      borderBottom: hasDiff
                        ? 'none'
                        : '1px solid var(--border)',
                    }}
                    className="hover:bg-[rgba(255,255,255,0.03)] transition"
                  >
                    {/* TIME */}
                    <td
                      className="p-4 whitespace-nowrap align-top"
                      style={{
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {format(new Date(log.time), 'yyyy-MM-dd HH:mm')}
                    </td>

                    {/* ACCOUNT */}
                    <td className="p-4 align-top">
                      <div
                        style={{ color: 'var(--foreground)', fontSize: '13px' }}
                      >
                        {accountName}
                      </div>
                      {accountEmail && (
                        <div
                          style={{
                            color: 'var(--muted-foreground)',
                            fontSize: '11px',
                          }}
                        >
                          {accountEmail}
                        </div>
                      )}
                    </td>

                    {/* EVENT */}
                    <td className="p-4 align-top">
                      <span
                        className="px-2 py-[3px] rounded-full text-xs capitalize"
                        style={{
                          backgroundColor: style.bg,
                          color: style.color,
                        }}
                      >
                        {log.event.replace(/-/g, ' ')}
                      </span>
                    </td>

                    {/* CHANGE */}
                    <td
                      className="p-4"
                      style={{
                        color: 'var(--foreground)',
                      }}
                    >
                      <details className="group">
                        {/* SUMMARY */}
                        <summary
                          className={`list-none flex items-center justify-between ${
                            hasDiff ? 'cursor-pointer' : 'pointer-events-none'
                          }`}
                        >
                          <span>
                            {log.change}
                            {byLabel && (
                              <span
                                style={{
                                  color: 'var(--muted-foreground)',
                                  fontSize: '12px',
                                  marginLeft: '6px',
                                }}
                              >
                                · by {byLabel}
                              </span>
                            )}
                          </span>

                          {hasDiff && (
                            <span
                              className="transition group-open:rotate-180"
                              style={{
                                color: 'var(--muted-foreground)',
                                fontSize: '12px',
                              }}
                            >
                              ▼
                            </span>
                          )}
                        </summary>

                        {/* EXPANDED CONTENT */}
                        {hasDiff && (
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            {/* REMOVED ONLY */}
                            {log.changeFrom && !log.changeTo && (
                              <>
                                <span
                                  className="px-3 py-1 rounded-full text-xs"
                                  style={{
                                    backgroundColor: 'var(--status-banned-bg)',
                                    color: 'var(--status-banned-text)',
                                  }}
                                >
                                  {log.changeFrom}
                                </span>

                                <span
                                  style={{
                                    color: 'var(--muted-foreground)',
                                    fontSize: '12px',
                                  }}
                                >
                                  removed
                                </span>
                              </>
                            )}

                            {/* ADDED ONLY */}
                            {!log.changeFrom && log.changeTo && (
                              <>
                                <span
                                  className="px-3 py-1 rounded-full text-xs"
                                  style={{
                                    backgroundColor: 'var(--status-active-bg)',
                                    color: 'var(--status-active-text)',
                                  }}
                                >
                                  {log.changeTo}
                                </span>

                                <span
                                  style={{
                                    color: 'var(--muted-foreground)',
                                    fontSize: '12px',
                                  }}
                                >
                                  added
                                </span>
                              </>
                            )}

                            {/* BEFORE → AFTER */}
                            {log.changeFrom && log.changeTo && (
                              <>
                                {/* FROM */}
                                <span
                                  className="px-3 py-1 rounded-full text-xs"
                                  style={{
                                    backgroundColor: 'var(--status-banned-bg)',
                                    color: 'var(--status-banned-text)',
                                  }}
                                >
                                  {log.changeFrom}
                                </span>

                                {/* ARROW */}
                                <span
                                  style={{
                                    color: 'var(--muted-foreground)',
                                  }}
                                >
                                  →
                                </span>

                                {/* TO */}
                                <span
                                  className="px-3 py-1 rounded-full text-xs"
                                  style={{
                                    backgroundColor: 'var(--status-active-bg)',
                                    color: 'var(--status-active-text)',
                                  }}
                                >
                                  {log.changeTo}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </details>
                    </td>
                  </tr>

                  {/* BORDER AFTER ACCORDION */}
                  {hasDiff && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          borderBottom: '1px solid var(--border)',
                        }}
                      />
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function LogsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading logs...</div>}>
      <LogsView />
    </Suspense>
  )
}
