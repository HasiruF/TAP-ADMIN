import { api } from '@/lib/api/client'

export function fetchAdminUsers(page: number, role?: string) {
  const params = new URLSearchParams({ page: String(page), limit: '50' })
  if (role && role !== 'all') params.set('role', role)
  return api(`/admin/users?${params.toString()}`)
}

export function suspendUser(userId: string, reason: string) {
  return api('/admin/user/suspend', {
    method: 'POST',
    body: JSON.stringify({ id: userId, reason }),
  })
}

export function unsuspendUser(userId: string) {
  return api('/admin/user/unsuspend', {
    method: 'POST',
    body: JSON.stringify({ id: userId }),
  })
}

export function banUser(userId: string, reason: string) {
  return api('/admin/user/ban', {
    method: 'POST',
    body: JSON.stringify({ id: userId, reason }),
  })
}
