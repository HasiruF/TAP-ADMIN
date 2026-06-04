import { useQuery } from '@tanstack/react-query'
import { fetchAdminUsers } from '@/lib/api/admin/users'

export function useAdminUsers(page: number) {
  return useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => fetchAdminUsers(page),
    staleTime: 1000 * 60 * 2,
  })
}
