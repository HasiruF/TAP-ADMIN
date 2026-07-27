// src/components/admin/overview/AnalyticsOverview.tsx
'use client'

import { UserGrowthChart } from './UserGrowthChart'
import { ArtistGenreChart } from './ArtistGenreChart'
import { ArtistLocationChart } from './ArtistLocationChart'

export function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      <UserGrowthChart />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ArtistGenreChart />
        <ArtistLocationChart />
      </div>
    </div>
  )
}
