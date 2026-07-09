import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
    onError: () => {
      toast.error("We couldn't approve this item. Please try again.")
    },
  })

  const reject = useMutation({
    mutationFn: rejectModeration,
    onSuccess: invalidateQueue,
    onError: () => {
      toast.error("We couldn't reject this item. Please try again.")
    },
  })

  return {
    approveModeration: approve.mutate,
    rejectModeration: reject.mutate,
    isApproving: approve.isPending,
    isRejecting: reject.isPending,
  }
}
