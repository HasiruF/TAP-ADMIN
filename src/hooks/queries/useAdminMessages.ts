import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminConversations,
  ConversationQuery,
} from '@/lib/api/admin/messages'

export function useAdminMessages(filters: ConversationQuery = {}) {
  return useQuery({
    queryKey: ['admin-conversations', filters], // 🔥 critical
    queryFn: () => fetchAdminConversations(filters),
    staleTime: 1000 * 60 * 2,
  })
}
