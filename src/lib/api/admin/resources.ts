import { api } from '@/lib/api/client'
import type { Resource, ResourceItemInput } from '@/types/resource'

export async function fetchResources(): Promise<Resource[]> {
  return api('/admin/resources')
}

export async function updateResources(
  items: ResourceItemInput[]
): Promise<{ message: string }> {
  return api('/admin/resources', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })
}
