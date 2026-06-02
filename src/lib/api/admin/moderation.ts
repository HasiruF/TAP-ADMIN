export async function fetchModerationQueue() {
  const res = await fetch('/api/admin/moderation')

  if (!res.ok) {
    throw new Error('Failed to fetch moderation queue')
  }

  return res.json()
}
