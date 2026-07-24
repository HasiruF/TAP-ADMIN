// src/components/admin/overview/ArtistGenreChart.tsx
'use client'

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { Music2 } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useArtistGenreDistribution } from '@/hooks/queries/useAdminAnalytics'
import {
  CATEGORY_PALETTE,
  ChartEmpty,
  ChartError,
  ChartHeader,
  ChartLoading,
} from './shared'

const chartConfig: ChartConfig = {
  count: { label: 'Artists' },
}

export function ArtistGenreChart() {
  const { data, isLoading, error } = useArtistGenreDistribution()
  const items = data?.items ?? []

  return (
    <div
      className="relative flex h-full flex-col rounded-[32px] border p-8 overflow-hidden"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(201,168,76,0.35), transparent)',
        }}
      />
      <div className="mb-6">
        <ChartHeader
          icon={Music2}
          eyebrow="Platform Analytics"
          title="Genre Distribution"
          description="Shows how many artists on the platform belong to each music genre."
        />
      </div>

      {isLoading ? (
        <ChartLoading />
      ) : error ? (
        <ChartError message="Failed to load genre distribution" />
      ) : items.length === 0 ? (
        <ChartEmpty message="No genres assigned yet" />
      ) : (
        <div className="h-[320px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={items}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                dataKey="genreName"
                type="category"
                tickLine={false}
                axisLine={false}
                width={110}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel indicator="dot" />}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {items.map((item, index) => (
                  <Cell
                    key={item.genreId ?? item.genreName}
                    fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      )}

      {data && (
        <p
          className="mt-4"
          style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}
        >
          Based on {data.totalArtists.toLocaleString()} artist profiles
        </p>
      )}
    </div>
  )
}
