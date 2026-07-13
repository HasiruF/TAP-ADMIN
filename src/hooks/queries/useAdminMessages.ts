import { useQuery } from '@tanstack/react-query'
import {
  fetchAdminConversations,
  ConversationQuery,
} from '@/lib/api/admin/messages'

import { useAuthContext } from '@/lib/api/auth/AuthContext'

export function useAdminMessages(filters: ConversationQuery = {}) {
  const { isLoading } = useAuthContext()
  return useQuery({
    queryKey: ['admin-conversations', filters], // 🔥 critical
    queryFn: () => fetchAdminConversations(filters),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 15,

    enabled: !isLoading,
  })
}
