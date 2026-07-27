export interface Attachment {
  id: string
  type: 'IMAGE' | 'PDF' | 'LINK'
  name: string
  url: string
  size?: string
}

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead?: boolean
  isDeleted: boolean
  attachments?: Attachment[]
}

export interface ConversationParticipant {
  id: string
  role: 'artist' | 'venue' | 'user'
  name: string
  avatar?: string | null
}

export interface Conversation {
  id: string
  participants: [ConversationParticipant, ConversationParticipant]
  messages: Message[]
}
