import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchVendorListings,
  createVendorListing,
  updateVendorListing,
  deleteVendorListing,
  VendorListingInput,
} from '@/lib/api/admin/vendorListings'
import { useAuthContext } from '@/lib/api/auth/AuthContext'

export function useVendorListings() {
  const { isLoading } = useAuthContext()
  return useQuery({
    queryKey: ['vendor-listings'],
    queryFn: fetchVendorListings,
    staleTime: 1000 * 60 * 5,
    enabled: !isLoading,
  })
}

export function useCreateVendorListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VendorListingInput) => createVendorListing(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendor-listings'] }),
  })
}

export function useUpdateVendorListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Partial<VendorListingInput>
    }) => updateVendorListing(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendor-listings'] }),
  })
}

export function useDeleteVendorListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVendorListing(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendor-listings'] }),
  })
}
