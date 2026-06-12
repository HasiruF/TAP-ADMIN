const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface UploadedMedia {
  id: string
  storageKey: string
  mimeType: string
  originalFilename: string
}

/**
 * Multipart upload to POST /media/upload.
 * Separate from api() because the JSON Content-Type header must NOT be set
 * for FormData requests.
 */
export async function uploadMedia(file: File): Promise<UploadedMedia> {
  const token =
    typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1]
      : null

  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${BASE_URL}/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Upload failed')
  }

  return res.json()
}
