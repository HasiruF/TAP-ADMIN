import { api } from '@/lib/api/client'

export type UploadedFile = {
  id: string
  path: string
}

export function uploadFile(file: File): Promise<{ file: UploadedFile }> {
  const formData = new FormData()
  formData.append('file', file)

  return api('/files/upload', {
    method: 'POST',
    body: formData,
  })
}
