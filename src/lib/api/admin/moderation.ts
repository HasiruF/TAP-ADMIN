import { api } from '@/lib/api/client'

export interface ModerationItem {
  contentModId: string
  userId: string
  name: string
  type: 'img' | 'video' | string
  role: 'artist' | 'venue' | string
  date: string
  contentLink: string
}

export interface ModerationResponse {
  data: ModerationItem[]
}

export function fetchModerationQueue() {
  return api('/admin/moderation')
}

export function approveModeration(contentModId: string) {
  return api('/admin/moderation/approve', {
    method: 'POST',
    body: JSON.stringify({ contentModId }),
  })
}

export function rejectModeration(contentModId: string) {
  return api('/admin/moderation/reject', {
    method: 'POST',
    body: JSON.stringify({ contentModId }),
  })
}
