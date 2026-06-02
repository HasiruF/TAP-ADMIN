import { useQuery } from '@tanstack/react-query'
import { fetchAdminArtist } from '@/lib/api/admin/artists'

export function useAdminArtist(id: string) {
  return useQuery({
    queryKey: ['admin-artist', id],
    queryFn: () => fetchAdminArtist(id),
    enabled: !!id,
  })
}
