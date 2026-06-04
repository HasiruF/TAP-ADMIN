import { api } from '@/lib/api/client'

export function fetchAdminUsers(page: number) {
  return api(`/users?page=${page}&limit=50`)
}
