import { useQuery } from '@tanstack/react-query'
import { fetchAdminOverview } from '@/lib/api/admin/overview'

import { useAuthContext } from '@/lib/api/auth/AuthContext'
export function useAdminOverview() {
  const { isLoading } = useAuthContext()
  return useQuery({
    queryKey: ['admin-overview'],
    queryFn: fetchAdminOverview,
    staleTime: 1000 * 60 * 2,

    enabled: !isLoading,
  })
}
