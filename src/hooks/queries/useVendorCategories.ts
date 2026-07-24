import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchVendorCategories,
  createVendorCategory,
  updateVendorCategory,
  deleteVendorCategory,
  VendorCategoryInput,
} from '@/lib/api/admin/vendorCategories'
import { useAuthContext } from '@/lib/api/auth/AuthContext'

export function useVendorCategories() {
  const { isLoading } = useAuthContext()
  return useQuery({
    queryKey: ['vendor-categories'],
    queryFn: fetchVendorCategories,
    staleTime: 1000 * 60 * 5,
    enabled: !isLoading,
  })
}

export function useCreateVendorCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VendorCategoryInput) => createVendorCategory(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendor-categories'] }),
  })
}

export function useUpdateVendorCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Partial<VendorCategoryInput>
    }) => updateVendorCategory(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendor-categories'] }),
  })
}

export function useDeleteVendorCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVendorCategory(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vendor-categories'] }),
  })
}
