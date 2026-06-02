import { useQuery } from '@tanstack/react-query'
import { fetchAdminVenue } from '@/lib/api/admin/venues'

export function useAdminVenue(id: string) {
  return useQuery({
    queryKey: ['admin-venue', id],
    queryFn: () => fetchAdminVenue(id),
    enabled: !!id,
  })
}
