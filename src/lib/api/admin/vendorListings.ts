import { api } from '@/lib/api/client'
import type { VendorListing, VendorListingLink } from '@/types/vendor'

interface PaginatedResponse<T> {
  data: T[]
  hasNextPage: boolean
}

export async function fetchVendorListings(): Promise<VendorListing[]> {
  const res: PaginatedResponse<VendorListing> = await api(
    '/vendors/listings?limit=100'
  )
  return res.data
}

export interface VendorListingInput {
  name: string
  category: { id: string }
  bio?: string | null
  links?: VendorListingLink[]
  discountCode?: string | null
  discountDescription?: string | null
  isActive: boolean
  sortOrder: number
}

export function createVendorListing(
  input: VendorListingInput
): Promise<VendorListing> {
  return api('/vendors/listings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateVendorListing(
  id: string,
  input: Partial<VendorListingInput>
): Promise<VendorListing> {
  return api(`/vendors/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteVendorListing(id: string): Promise<void> {
  return api(`/vendors/listings/${id}`, { method: 'DELETE' })
}
