import { api } from '@/lib/api/client'

export interface ConversationParticipant {
  id: string
  name: string
  avatar: string | null
}

export interface Conversation {
  conversationId: string
  artist: ConversationParticipant | null
  venue: ConversationParticipant | null
  lastMessageAt: string | null
}

export interface ConversationQuery {
  id?: string
  artistId?: string
  venueId?: string
}

export function fetchAdminConversations(
  params: ConversationQuery = {}
): Promise<Conversation[]> {
  const searchParams = new URLSearchParams()

  if (params.id) searchParams.append('id', params.id)
  if (params.artistId) searchParams.append('artistId', params.artistId)
  if (params.venueId) searchParams.append('venueId', params.venueId)

  const query = searchParams.toString()

  return api(`/admin/conversations${query ? `?${query}` : ''}`)
}
