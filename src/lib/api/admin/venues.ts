import { api } from '@/lib/api/client'

export async function fetchAdminVenue(id: string) {
  return api(`/admin/venue/${id}`)
}

export function approveVenue(userId: string) {
  return api('/admin/venue/approve', {
    method: 'POST',
    body: JSON.stringify({ id: userId }),
  })
}

export function rejectVenue(userId: string, feedback: string) {
  return api('/admin/venue/reject', {
    method: 'POST',
    body: JSON.stringify({ id: userId, feedback }),
  })
}
