import { useQuery } from '@tanstack/react-query'
import { fetchModerationQueue } from '@/lib/api/admin/moderation'

export function useModerationQueue() {
  return useQuery({
    queryKey: ['moderation-queue'],
    queryFn: fetchModerationQueue,
  })
}
