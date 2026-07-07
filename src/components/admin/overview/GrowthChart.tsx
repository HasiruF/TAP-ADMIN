// src/components/admin/overview/GrowthChart.tsx

'use client'

import { TrendingUp } from 'lucide-react'

export function GrowthChart() {
  return (
    <div
      className="rounded-[32px] border p-8"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* HEADER */}
      <div className="mb-10">
        <p
          className="mb-2"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '11px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Platform Analytics
        </p>

        <h2
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '30px',
            lineHeight: '1',
            fontWeight: 500,
            color: 'var(--foreground)',
          }}
        >
          Platform Growth
        </h2>
      </div>

      {/* COMING SOON */}
      <div
        className="h-[420px] flex flex-col items-center justify-center gap-4 rounded-2xl border"
        style={{
          backgroundColor: 'var(--muted)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.12)',
          }}
        >
          <TrendingUp size={22} style={{ color: 'var(--gold)' }} />
        </div>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--foreground)',
          }}
        >
          Coming Soon
        </p>

        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: '13px',
          }}
        >
          Platform growth analytics will be available here soon.
        </p>
      </div>
    </div>
  )
}
