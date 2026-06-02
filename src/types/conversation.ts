export interface Attachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'pdf' | 'document'
  name: string
  url: string
  size?: string
}

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Date
  isRead?: boolean
  attachments?: Attachment[]
}

export interface Conversation {
  id: string
  artist: {
    id: string
    name: string
  }
  venue: {
    id: string
    name: string
  }
  messages: Message[]
}
