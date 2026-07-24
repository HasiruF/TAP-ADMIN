import { api } from '@/lib/api/client'
import type { VendorCategory } from '@/types/vendor'

interface PaginatedResponse<T> {
  data: T[]
  hasNextPage: boolean
}

export async function fetchVendorCategories(): Promise<VendorCategory[]> {
  const res: PaginatedResponse<VendorCategory> = await api(
    '/vendors/categories?limit=100'
  )
  return res.data
}

export interface VendorCategoryInput {
  name: string
  slug: string
  parentCategory?: { id: string } | null
  isActive: boolean
  sortOrder: number
}

export function createVendorCategory(
  input: VendorCategoryInput
): Promise<VendorCategory> {
  return api('/vendors/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateVendorCategory(
  id: string,
  input: Partial<VendorCategoryInput>
): Promise<VendorCategory> {
  return api(`/vendors/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteVendorCategory(id: string): Promise<void> {
  return api(`/vendors/categories/${id}`, { method: 'DELETE' })
}
