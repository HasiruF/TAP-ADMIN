import { useQuery } from '@tanstack/react-query'
import { fetchAdminArtist } from '@/lib/api/admin/artists'

import { useAuthContext } from '@/lib/api/auth/AuthContext'
export function useAdminArtist(id: string) {
  const { isLoading } = useAuthContext()
  return useQuery({
    queryKey: ['admin-artist', id],
    queryFn: () => fetchAdminArtist(id),
    enabled: !!id && !isLoading,
  })
}
