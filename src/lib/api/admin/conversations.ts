import { api } from '@/lib/api/client'

export interface Message {
  senderId: string
  senderRole: string
  message: string
  timestamp: string
  attachments: string[]
}

export interface ConversationThreadResponse {
  conversationId: string
  messages: Message[]
}

export function fetchConversationThread(id: string) {
  return api(`/admin/conversations/${id}`)
}
