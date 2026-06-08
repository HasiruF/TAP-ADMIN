import { api } from '@/lib/api/client'

export interface AdminOverviewResponse {
  totArtists: number
  totVenues: number
  totPendingArtist: number
  totPendingVenue: number
}

export function fetchAdminOverview() {
  return api('/admin/overview')
}
