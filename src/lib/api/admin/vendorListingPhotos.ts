import { api } from '@/lib/api/client'
import type { VendorListingPhoto, VendorPhotoType } from '@/types/vendor'

interface PaginatedResponse<T> {
  data: T[]
  hasNextPage: boolean
}

export async function fetchVendorListingPhotos(
  vendorListingId: string
): Promise<VendorListingPhoto[]> {
  const res: PaginatedResponse<VendorListingPhoto> = await api(
    `/vendors/listing-photos?vendorListingId=${vendorListingId}&limit=50`
  )
  return res.data
}

export interface VendorListingPhotoInput {
  vendorListing: { id: string }
  mediaAssetId: string
  photoType: VendorPhotoType
  sortOrder: number
  caption?: string | null
}

export function createVendorListingPhoto(
  input: VendorListingPhotoInput
): Promise<VendorListingPhoto> {
  return api('/vendors/listing-photos', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateVendorListingPhoto(
  id: string,
  input: Partial<VendorListingPhotoInput>
): Promise<VendorListingPhoto> {
  return api(`/vendors/listing-photos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteVendorListingPhoto(id: string): Promise<void> {
  return api(`/vendors/listing-photos/${id}`, { method: 'DELETE' })
}
