import { useQuery } from '@tanstack/react-query'
import { fetchAdminVenue } from '@/lib/api/admin/venues'

import { useAuthContext } from '@/lib/api/auth/AuthContext'
export function useAdminVenue(id: string) {
  const { isLoading } = useAuthContext()
  return useQuery({
    queryKey: ['admin-venue', id],
    queryFn: () => fetchAdminVenue(id),
    enabled: !!id && !isLoading,
  })
}
