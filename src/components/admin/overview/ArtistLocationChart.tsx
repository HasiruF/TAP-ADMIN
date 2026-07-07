// src/components/admin/overview/ArtistLocationChart.tsx
'use client'

import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { ChevronLeft, MapPin } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useArtistLocationDistribution } from '@/hooks/queries/useAdminAnalytics'
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

export function ArtistLocationChart() {
  const { data, isLoading, error } = useArtistLocationDistribution()
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)

  const cities = data?.cities ?? []
  const activeCity = cities.find((c) => c.cityId === selectedCityId) ?? null

  const chartData = activeCity
    ? activeCity.regions.map((r) => ({
        key: r.regionId,
        name: r.regionName,
        count: r.count,
      }))
    : cities.map((c) => ({ key: c.cityId, name: c.cityName, count: c.count }))

  return (
    <div
      className="flex h-full flex-col rounded-[32px] border p-8"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <ChartHeader
          icon={MapPin}
          eyebrow="Platform Analytics"
          title={activeCity ? activeCity.cityName : 'Artist Locations'}
          description={
            activeCity
              ? 'Shows how artists in this city are spread across its suburbs.'
              : 'Shows where artists are based by city. Click a city to see its suburbs.'
          }
        />
        {activeCity && (
          <button
            onClick={() => setSelectedCityId(null)}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[13px] font-medium"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--muted-foreground)',
            }}
          >
            <ChevronLeft size={14} /> All Cities
          </button>
        )}
      </div>

      {isLoading ? (
        <ChartLoading />
      ) : error ? (
        <ChartError message="Failed to load location distribution" />
      ) : chartData.length === 0 ? (
        <ChartEmpty
          message={
            activeCity ? 'No suburb data for this city' : 'No location data yet'
          }
        />
      ) : (
        <div className="h-[320px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={chartData}
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
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={110}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={<ChartTooltipContent hideLabel indicator="dot" />}
              />
              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                onClick={(bar) => {
                  if (activeCity) return
                  const key = bar?.payload?.key
                  if (key) setSelectedCityId(key)
                }}
              >
                {chartData.map((d, i) => (
                  <Cell
                    key={d.key}
                    fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]}
                    style={{ cursor: activeCity ? 'default' : 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {!activeCity && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
            Click a city to drill into its suburbs
          </p>
        )}
        {data && data.unspecifiedCount > 0 && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
            {data.unspecifiedCount.toLocaleString()} artists have no location
            set
          </p>
        )}
      </div>
    </div>
  )
}
