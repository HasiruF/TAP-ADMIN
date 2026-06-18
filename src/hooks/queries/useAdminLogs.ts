import { useQuery } from '@tanstack/react-query'
import { fetchAdminLogs } from '@/lib/api/admin/logs'
import { ActivityLog } from '@/types/logs'
export function useAdminLogs(userId?: string) {
  return useQuery<ActivityLog[]>({
    queryKey: ['admin-logs', userId ?? 'all'],
    queryFn: () => fetchAdminLogs(userId),
  })
}
