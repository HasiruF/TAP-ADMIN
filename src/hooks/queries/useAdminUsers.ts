import { useQuery } from '@tanstack/react-query'
import { fetchAdminUsers } from '@/lib/api/admin/users'

export function useAdminUsers(page: number, role?: string) {
  return useQuery({
    queryKey: ['admin-users', page, role],
    queryFn: () => fetchAdminUsers(page, role),
    staleTime: 1000 * 60 * 2,
  })
}
