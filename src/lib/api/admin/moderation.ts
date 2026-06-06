export async function fetchModerationQueue() {
  const res = await fetch('/api/admin/moderation')

  if (!res.ok) {
    throw new Error('Failed to fetch moderation queue')
  }

  return res.json()
}

export async function moderationAction(
  contentModId: string,
  action: 'approve' | 'reject'
) {
  const res = await fetch('/api/admin/moderation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentModId, action }),
  })

  if (!res.ok) {
    throw new Error('Moderation action failed')
  }

  return res.json()
}
