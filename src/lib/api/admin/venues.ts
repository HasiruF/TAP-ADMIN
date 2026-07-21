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

export function addRegionSuggestion(suggestionId: string) {
  return api('/admin/venue/region-suggestions/add', {
    method: 'POST',
    body: JSON.stringify({ id: suggestionId }),
  })
}

export function dismissRegionSuggestion(suggestionId: string) {
  return api('/admin/venue/region-suggestions/dismiss', {
    method: 'POST',
    body: JSON.stringify({ id: suggestionId }),
  })
}
