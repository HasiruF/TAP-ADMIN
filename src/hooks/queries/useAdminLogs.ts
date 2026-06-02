import { useQuery } from '@tanstack/react-query'
import { fetchAdminLogs } from '@/lib/api/admin/logs'
import { ActivityLog } from '@/types/logs'
export function useAdminLogs() {
  return useQuery<ActivityLog[]>({
    queryKey: ['admin-logs'],
    queryFn: fetchAdminLogs,
  })
}
