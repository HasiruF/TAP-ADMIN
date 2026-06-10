import { api } from '@/lib/api/client'

export async function fetchAdminLogs(userId?: string) {
  const query = userId ? `?userId=${userId}` : ''
  return api(`/admin/logs${query}`)
}
