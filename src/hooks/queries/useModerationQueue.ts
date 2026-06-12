import { useQuery } from '@tanstack/react-query'
import { fetchModerationQueue } from '@/lib/api/admin/moderation'
import { approveModeration, rejectModeration } from '@/lib/api/admin/moderation'
export function useModerationQueue() {
  return useQuery({
    queryKey: ['moderation-queue'],
    queryFn: fetchModerationQueue,
    select: (res) => res ?? [],
  })
}
