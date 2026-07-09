import type { Metadata } from 'next'
import ModerationClient from './ModerationClient'

export const metadata: Metadata = {
  title: 'Content Moderation — TAP Admin',
}

export default function ContentModerationPage() {
  return <ModerationClient />
}
