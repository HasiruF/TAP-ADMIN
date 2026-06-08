import { api } from '@/lib/api/client'

export function fetchResources() {
  return api('/admin/resources')
}
export function updateResources(items: any[]) {
  return api('/admin/resources', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
}
