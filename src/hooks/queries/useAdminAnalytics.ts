import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/lib/api/auth/AuthContext'
import {
  fetchUserGrowth,
  fetchArtistGenreDistribution,
  fetchArtistLocationDistribution,
  UserGrowthRange,
  UserGrowthResponse,
  ArtistGenreDistributionResponse,
  ArtistLocationDistributionResponse,
} from '@/lib/api/admin/analytics'

// Charts poll on this interval rather than pushing over a socket — there's no
// realtime transport in this stack, so "live" here means short-interval refetch.
const REALTIME_POLL_MS = 30_000

export function useUserGrowth(range: UserGrowthRange) {
  const { isLoading } = useAuthContext()
  return useQuery<UserGrowthResponse>({
    queryKey: ['admin-analytics', 'user-growth', range],
    queryFn: () => fetchUserGrowth(range),
    enabled: !isLoading,
    refetchInterval: REALTIME_POLL_MS,
    staleTime: REALTIME_POLL_MS,
  })
}

export function useArtistGenreDistribution() {
  const { isLoading } = useAuthContext()
  return useQuery<ArtistGenreDistributionResponse>({
    queryKey: ['admin-analytics', 'artist-genres'],
    queryFn: fetchArtistGenreDistribution,
    enabled: !isLoading,
    refetchInterval: REALTIME_POLL_MS,
    staleTime: REALTIME_POLL_MS,
  })
}

export function useArtistLocationDistribution() {
  const { isLoading } = useAuthContext()
  return useQuery<ArtistLocationDistributionResponse>({
    queryKey: ['admin-analytics', 'artist-locations'],
    queryFn: fetchArtistLocationDistribution,
    enabled: !isLoading,
    refetchInterval: REALTIME_POLL_MS,
    staleTime: REALTIME_POLL_MS,
  })
}
