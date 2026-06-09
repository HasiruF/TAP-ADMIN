import { useMutation } from '@tanstack/react-query'
import { uploadFile } from '@/lib/api/admin/uploadfiles'

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
  })
}
