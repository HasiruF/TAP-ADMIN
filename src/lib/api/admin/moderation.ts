import { api } from '@/lib/api/client'

export interface ModerationItem {
  contentModId: string
  userId: string | null
  email: string | null
  name: string | null
  type: 'images' | 'video' | string
  role: 'artist' | 'venue' | string | null
  reason: string
  date: string
  contentLink: string | null
}

export interface ModerationResponse {
  data: ModerationItem[]
}

const ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? '').replace('/api/v1', '')

/**
 * Resolves a backend contentLink (an absolute URL, or a storage key that begins
 * with /api/v1/...) into a URL the admin browser can load directly.
 */
export function resolveContentUrl(link: string | null): string | null {
  if (!link) return null
  return link.startsWith('http') ? link : `${ORIGIN}${link}`
}

export function fetchModerationQueue(): Promise<ModerationItem[]> {
  return api('/admin/moderation')
}

export function approveModeration(contentModId: string) {
  return api('/admin/moderation/approve', {
    method: 'POST',
    body: JSON.stringify({ contentModId }),
  })
}

export function rejectModeration({
  contentModId,
  reviewNotes,
}: {
  contentModId: string
  reviewNotes: string
}) {
  return api('/admin/moderation/reject', {
    method: 'POST',
    body: JSON.stringify({ contentModId, reviewNotes }),
  })
}
