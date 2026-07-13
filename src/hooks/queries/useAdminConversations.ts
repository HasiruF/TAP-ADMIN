import { useQuery } from '@tanstack/react-query'
import { fetchConversationThread } from '@/lib/api/admin/conversations'

import { useAuthContext } from '@/lib/api/auth/AuthContext'
export function useConversationThread(id: string | undefined) {
  const { isLoading } = useAuthContext()
  return useQuery({
    queryKey: ['conversation-thread', id],
    queryFn: () => fetchConversationThread(id as string),
    refetchInterval: 1000 * 15,
    enabled: !!id && !isLoading,
  })
}
