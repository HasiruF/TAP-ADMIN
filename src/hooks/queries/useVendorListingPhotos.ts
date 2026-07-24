import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchVendorListingPhotos,
  createVendorListingPhoto,
  deleteVendorListingPhoto,
  VendorListingPhotoInput,
} from '@/lib/api/admin/vendorListingPhotos'

export function useVendorListingPhotos(vendorListingId: string | null) {
  return useQuery({
    queryKey: ['vendor-listing-photos', vendorListingId],
    queryFn: () => fetchVendorListingPhotos(vendorListingId as string),
    enabled: !!vendorListingId,
  })
}

export function useCreateVendorListingPhoto(vendorListingId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VendorListingPhotoInput) =>
      createVendorListingPhoto(input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['vendor-listing-photos', vendorListingId],
      }),
  })
}

export function useDeleteVendorListingPhoto(vendorListingId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVendorListingPhoto(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['vendor-listing-photos', vendorListingId],
      }),
  })
}
