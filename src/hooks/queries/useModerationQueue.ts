import { useQuery } from '@tanstack/react-query'
import { fetchModerationQueue } from '@/lib/api/admin/moderation'

import { useAuthContext } from '@/lib/api/auth/AuthContext'
export function useModerationQueue() {
  const { isLoading } = useAuthContext()
  return useQuery({
    queryKey: ['moderation-queue'],
    queryFn: fetchModerationQueue,
    select: (res) => res ?? [],

    enabled: !isLoading,
  })
}
