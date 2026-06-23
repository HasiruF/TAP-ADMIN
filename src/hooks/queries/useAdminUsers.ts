import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/lib/api/auth/AuthContext'
import { fetchAdminUsers } from '@/lib/api/admin/users'
export function useAdminUsers(page: number, role?: string) {
  const { isLoading } = useAuthContext()

  return useQuery({
    queryKey: ['admin-users', page, role],

    queryFn: () => fetchAdminUsers(page, role),

    enabled: !isLoading,
  })
}
