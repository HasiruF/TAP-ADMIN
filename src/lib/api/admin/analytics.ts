import { api } from '@/lib/api/client'

export type UserGrowthRange = '7d' | '30d' | '3m'

export interface UserGrowthPoint {
  date: string
  artists: number
  venues: number
}

export interface UserGrowthResponse {
  range: UserGrowthRange
  from: string
  to: string
  totals: { artists: number; venues: number }
  series: UserGrowthPoint[]
}

export function fetchUserGrowth(range: UserGrowthRange) {
  return api(`/admin/analytics/user-growth?range=${range}`)
}

export interface GenreDistributionItem {
  genreId: string | null
  genreName: string
  count: number
}

export interface ArtistGenreDistributionResponse {
  totalArtists: number
  items: GenreDistributionItem[]
}

export function fetchArtistGenreDistribution() {
  return api('/admin/analytics/artist-genres')
}

export interface LocationRegionCount {
  regionId: string
  regionName: string
  count: number
}

export interface LocationCityCount {
  cityId: string
  cityName: string
  count: number
  regions: LocationRegionCount[]
}

export interface ArtistLocationDistributionResponse {
  totalArtists: number
  unspecifiedCount: number
  cities: LocationCityCount[]
}

export function fetchArtistLocationDistribution() {
  return api('/admin/analytics/artist-locations')
}
