import { useQuery } from '@tanstack/react-query'
import { fetchAdminOverview } from '@/lib/api/admin/overview'

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin-overview'],
    queryFn: fetchAdminOverview,
    staleTime: 1000 * 60 * 2,
  })
}
