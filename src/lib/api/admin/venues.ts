import { api } from '@/lib/api/client'

export async function fetchAdminVenue(id: string) {
  const res = await fetch(`/api/admin/venue/${id}`)

  if (!res.ok) {
    throw new Error('Failed to fetch venue')
  }

  return res.json()
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
