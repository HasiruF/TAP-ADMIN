import { api } from '@/lib/api/client'

export async function fetchResources() {
  return api('/admin/resources')
}

export async function updateResources(items: unknown[]) {
  return api('/admin/resources', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
}
