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

export interface Conversation {
  id: string
  artist: {
    id: string
    name: string
    avatar?: string | null
  }
  venue: {
    id: string
    name: string
    avatar?: string | null
  }
  messages: Message[]
}
