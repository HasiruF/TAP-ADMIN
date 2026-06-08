import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateResources } from '@/lib/api/admin/resources'

export function useUpdateResources() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateResources,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['resources'],
      })
    },
  })
}
