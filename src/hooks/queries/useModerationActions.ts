import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveModeration, rejectModeration } from '@/lib/api/admin/moderation'

export function useModerationActions() {
  const queryClient = useQueryClient()

  const invalidateQueue = () => {
    queryClient.invalidateQueries({
      queryKey: ['moderation-queue'],
    })
  }

  const approve = useMutation({
    mutationFn: approveModeration,
    onSuccess: invalidateQueue,
  })

  const reject = useMutation({
    mutationFn: rejectModeration,
    onSuccess: invalidateQueue,
  })

  return {
    approveModeration: approve.mutate,
    rejectModeration: reject.mutate,
    isApproving: approve.isPending,
    isRejecting: reject.isPending,
  }
}
