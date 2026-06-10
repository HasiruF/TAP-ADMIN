import { api } from '@/lib/api/client'

export async function fetchAdminMessages() {
  return api('/admin/messages')
}
