import { api } from '@/lib/api/client'

export async function fetchModerationQueue() {
  return api('/admin/moderation')
}

export async function moderationAction(
  contentModId: string,
  action: 'approve' | 'reject'
) {
  return api(`/admin/moderation/${contentModId}/${action}`, {
    method: 'POST',
  })
}
