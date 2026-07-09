import type { Metadata } from 'next'
import MessagesClient from './MessagesClient'

export const metadata: Metadata = {
  title: 'Message Moderation — TAP Admin',
}

export default function MessagesPage() {
  return <MessagesClient />
}
