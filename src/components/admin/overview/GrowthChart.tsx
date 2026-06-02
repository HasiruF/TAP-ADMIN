// src/components/admin/overview/GrowthChart.tsx

'use client'

import { useMemo, useState } from 'react'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'

type TimeRange = '14d' | '30d' | '1y'

const dataMap = {
  '14d': [
    { label: 'Day 1', artists: 120, venues: 22 },
    { label: 'Day 3', artists: 140, venues: 25 },
    { label: 'Day 5', artists: 180, venues: 29 },
    { label: 'Day 7', artists: 220, venues: 33 },
    { label: 'Day 9', artists: 280, venues: 41 },
    { label: 'Day 11', artists: 340, venues: 52 },
    { label: 'Day 14', artists: 340, venues: 64 },
  ],

  '30d': [
    { label: 'Week 1', artists: 420, venues: 68 },
    { label: 'Week 2', artists: 540, venues: 82 },
    { label: 'Week 3', artists: 690, venues: 95 },
    { label: 'Week 4', artists: 820, venues: 118 },
  ],

  '1y': [
    { label: 'Jan', artists: 320, venues: 45 },
    { label: 'Feb', artists: 410, venues: 52 },
    { label: 'Mar', artists: 520, venues: 61 },
    { label: 'Apr', artists: 610, venues: 70 },
    { label: 'May', artists: 720, venues: 84 },
    { label: 'Jun', artists: 860, venues: 101 },
    { label: 'Jul', artists: 940, venues: 116 },
    { label: 'Aug', artists: 1220, venues: 130 },
    { label: 'Sep', artists: 1100, venues: 142 },
    { label: 'Oct', artists: 1210, venues: 155 },
    { label: 'Nov', artists: 1300, venues: 168 },
    { label: 'Dec', artists: 1420, venues: 182 },
  ],
}

export function GrowthChart() {
  const [range, setRange] = useState<TimeRange>('30d')

  const [showArtists, setShowArtists] = useState(true)
  const [showVenues, setShowVenues] = useState(true)

  const data = useMemo(() => dataMap[range], [range])

  return (
    <div
      className="rounded-[32px] border p-8"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* HEADER */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10">
        <div>
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

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Artists Toggle */}
          <Button
            variant={showArtists ? 'default' : 'outline'}
            onClick={() => setShowArtists(!showArtists)}
            style={
              showArtists
                ? {
                    backgroundColor: 'var(--chart-artists)',
                    color: 'var(--primary-foreground)',
                  }
                : {}
            }
          >
            Artists
          </Button>

          {/* Venues Toggle */}
          <Button
            variant={showVenues ? 'default' : 'outline'}
            onClick={() => setShowVenues(!showVenues)}
            style={
              showVenues
                ? {
                    backgroundColor: 'var(--chart-venues)',
                    color: 'var(--primary-foreground)',
                  }
                : {}
            }
          >
            Venues
          </Button>

          {/* RANGE */}
          <div
            className="flex items-center gap-2 p-1 rounded-2xl border"
            style={{
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--border)',
            }}
          >
            {[
              { label: '14 Days', value: '14d' },
              { label: 'Month', value: '30d' },
              { label: 'Year', value: '1y' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value as TimeRange)}
                className="px-4 py-2 rounded-xl transition-all text-sm"
                style={{
                  backgroundColor:
                    range === item.value ? 'var(--accent)' : 'transparent',

                  color:
                    range === item.value
                      ? 'var(--accent-foreground)'
                      : 'var(--muted-foreground)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="artistsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-artists)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-artists)"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient id="venuesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-venues)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-venues)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="var(--border)" vertical={false} />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: 'var(--muted-foreground)',
                fontSize: 12,
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: 'var(--muted-foreground)',
                fontSize: 12,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                color: 'var(--foreground)',
              }}
              labelStyle={{
                color: 'var(--foreground)',
              }}
            />

            {/* ARTISTS */}
            {showArtists && (
              <Area
                type="monotone"
                dataKey="artists"
                stroke="var(--chart-artists)"
                strokeWidth={3}
                fill="url(#artistsGradient)"
              />
            )}

            {/* VENUES */}
            {showVenues && (
              <Area
                type="monotone"
                dataKey="venues"
                stroke="var(--chart-venues)"
                strokeWidth={3}
                fill="url(#venuesGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
