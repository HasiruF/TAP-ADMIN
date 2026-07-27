import { getAccessToken, setAccessToken } from '@/lib/api/client'
import { refresh } from '@/lib/api/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface UploadedMediaAsset {
  id: string
  photoUrl: string | null
}

/**
 * Multipart upload to POST /media-assets/upload — creates the MediaAsset row
 * vendor listing photos reference. Separate from api() because the JSON
 * Content-Type header must NOT be set for FormData requests (mirrors
 * uploadMedia() in lib/api/media.ts).
 */
export async function uploadMediaAsset(
  file: File
): Promise<UploadedMediaAsset> {
  const form = new FormData()
  form.append('file', file)

  const request = async (authToken?: string | null) =>
    fetch(`${BASE_URL}/media-assets/upload`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: form,
    })

  let res = await request(getAccessToken())

  if (res.status === 401) {
    const newTokens = await refresh()
    setAccessToken(newTokens.token, newTokens.tokenExpires)
    res = await request(newTokens.token)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Upload failed')
  }

  return res.json()
}
