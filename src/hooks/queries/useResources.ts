import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchResources, updateResources } from '@/lib/api/admin/resources'
import type { ResourceItemInput } from '@/types/resource'

export function useResources() {
  return useQuery({
    queryKey: ['admin-resources'],
    queryFn: fetchResources,
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
