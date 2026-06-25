import { useQuery } from '@tanstack/react-query'
import { fetchAdminLogs } from '@/lib/api/admin/logs'
import { ActivityLog } from '@/types/logs'

import { useAuthContext } from '@/lib/api/auth/AuthContext'
export function useAdminLogs(userId?: string) {
  const { isLoading } = useAuthContext()
  return useQuery<ActivityLog[]>({
    queryKey: ['admin-logs', userId ?? 'all'],
    queryFn: () => fetchAdminLogs(userId),

    enabled: !isLoading,
  })
}
