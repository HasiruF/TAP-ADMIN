import { api } from '@/lib/api/client'

export function fetchAdminUsers(page: number) {
  return api(`/users?page=${page}&limit=50`)
}

export function suspendUser(userId: string) {
  return api('/admin/user/suspend', {
    method: 'POST',
    body: JSON.stringify({ id: userId }),
  })
}

export function unsuspendUser(userId: string) {
  return api('/admin/user/unsuspend', {
    method: 'POST',
    body: JSON.stringify({ id: userId }),
  })
}
