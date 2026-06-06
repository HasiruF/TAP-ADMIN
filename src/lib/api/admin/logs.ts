export async function fetchAdminLogs(userId?: string) {
  const query = userId ? `?userId=${userId}` : ''
  const res = await fetch(`/api/admin/logs${query}`)

  if (!res.ok) {
    throw new Error('Failed to fetch logs')
  }

  return res.json()
}
