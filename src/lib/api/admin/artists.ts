import { api } from '@/lib/api/client'

export async function fetchAdminArtist(id: string) {
  const res = await fetch(`/api/admin/artist/${id}`)

  if (!res.ok) {
    throw new Error('Failed to fetch artist')
  }

  return res.json()
}

export function approveArtist(userId: string) {
  return api('/admin/user/approve', {
    method: 'POST',
    body: JSON.stringify({ id: userId }),
  })
}

export function rejectArtist(userId: string, feedback: string) {
  return api('/admin/user/reject', {
    method: 'POST',
    body: JSON.stringify({ id: userId, feedback }),
  })
}

export function requestArtistChanges(userId: string, feedback: string) {
  return api('/admin/user/req-changes', {
    method: 'POST',
    body: JSON.stringify({ id: userId, feedback }),
  })
}
