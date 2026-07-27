// src/components/admin/overview/UserGrowthChart.tsx
'use client'

import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { TrendingUp } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useUserGrowth } from '@/hooks/queries/useAdminAnalytics'
import type { UserGrowthRange } from '@/lib/api/admin/analytics'
import { ChartHeader, ChartLoading, ChartError } from './shared'
import { formatDateOnly } from '@/lib/utils/date'

const RANGES: { value: UserGrowthRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '3m', label: '3 Months' },
]

const chartConfig: ChartConfig = {
  artists: { label: 'Artists', color: 'var(--chart-artists)' },
  venues: { label: 'Venues', color: 'var(--chart-venues)' },
}

function formatDateLabel(dateStr: string, range: UserGrowthRange) {
  return formatDateOnly(
    dateStr,
    {
      month: 'short',
      day: 'numeric',
      ...(range === '7d' ? { weekday: 'short' } : {}),
    },
    'en-US'
  )
}

export function UserGrowthChart() {
  const [range, setRange] = useState<UserGrowthRange>('30d')
  const { data, isLoading, error } = useUserGrowth(range)

  const series = (data?.series ?? []).map((point) => ({
    ...point,
    label: formatDateLabel(point.date, range),
  }))

  return (
    <div
      className="rounded-[32px] border p-8"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <ChartHeader
          icon={TrendingUp}
          eyebrow="Platform Analytics"
          title="User Growth"
          description="Shows how many new artists and venues joined the platform each day."
        />

        <div
          className="flex items-center gap-1 rounded-xl border p-1"
          style={{ borderColor: 'var(--border)' }}
        >
          {RANGES.map((r) => {
            const isActive = r.value === range
            return (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                style={{
                  backgroundColor: isActive
                    ? 'var(--foreground)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--primary-foreground)'
                    : 'var(--muted-foreground)',
                }}
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors"
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <ChartLoading />
      ) : error ? (
        <ChartError message="Failed to load user growth data" />
      ) : (
        <div className="h-[360px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart data={series} margin={{ left: 0, right: 12, top: 12 }}>
              <defs>
                <linearGradient id="fillArtists" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-artists)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-artists)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient id="fillVenues" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-venues)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-venues)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={32}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="artists"
                type="monotone"
                fill="url(#fillArtists)"
                stroke="var(--color-artists)"
                strokeWidth={2}
              />
              <Area
                dataKey="venues"
                type="monotone"
                fill="url(#fillVenues)"
                stroke="var(--color-venues)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      )}
    </div>
  )
}
