'use client'
import React from 'react'
import { activityLogsMock } from '@/data_mock/activityLogs'
import { format } from 'date-fns'
import { useAdminLogs } from '@/hooks/queries/useAdminLogs'
export default function LogsPage() {
  const { data: logs = [], isLoading, error } = useAdminLogs()

  const user = {
    name: 'Aria Stone',
    id: 'usr_1001',
  }

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
          {user.name}
        </h1>

        <p
          style={{
            marginTop: '8px',
            color: 'var(--muted-foreground)',
            fontSize: '13px',
          }}
        >
          User ID: <span style={{ color: 'var(--foreground)' }}>{user.id}</span>
        </p>
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
              <th className="p-4 text-left w-[220px]">Date & Time</th>
              <th className="p-4 text-left w-[180px]">Event</th>
              <th className="p-4 text-left">Change</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {logs.map((log) => {
              const hasDiff = log.changeFrom || log.changeTo

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
                      {format(log.time, 'yyyy-MM-dd HH:mm')}
                    </td>

                    {/* EVENT */}
                    <td className="p-4 align-top">
                      <span
                        className="px-2 py-[3px] rounded-full text-xs capitalize"
                        style={{
                          backgroundColor: 'rgba(201,168,76,0.12)',
                          color: 'var(--gold)',
                        }}
                      >
                        {log.event.replace('-', ' ')}
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
                          <span>{log.change}</span>

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
                        colSpan={3}
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
