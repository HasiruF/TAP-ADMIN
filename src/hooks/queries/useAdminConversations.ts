import { useQuery } from '@tanstack/react-query'
import { fetchConversationThread } from '@/lib/api/admin/conversations'

export function useConversationThread(id: string | undefined) {
  return useQuery({
    queryKey: ['conversation-thread', id],
    queryFn: () => fetchConversationThread(id as string),
    enabled: id !== null,
  })
}
