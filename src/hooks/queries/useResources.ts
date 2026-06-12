import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchResources, updateResources } from '@/lib/api/admin/resources'
import type { ResourceItemInput } from '@/types/resource'

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateResources() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: ResourceItemInput[]) => updateResources(items),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] }),
  })
}
