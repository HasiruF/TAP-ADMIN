import { api } from '@/lib/api/client'

export interface MessageAttachment {
  id: string
  type: 'IMAGE' | 'PDF' | 'LINK'
  url: string
  name: string | null
  previewUrl: string | null
}

export interface Message {
  senderId: string
  senderRole: string | null
  message: string | null
  isDeleted: boolean
  timestamp: string
  attachments: MessageAttachment[]
}

export interface ConversationThreadResponse {
  conversationId: string
  messages: Message[]
}

export function fetchConversationThread(
  id: string
): Promise<ConversationThreadResponse> {
  return api(`/admin/conversations/${id}`)
}
