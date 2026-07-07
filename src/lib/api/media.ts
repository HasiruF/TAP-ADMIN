import { getAccessToken, setAccessToken } from './client'
import { refresh } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface UploadedMedia {
  id: string
  storageKey: string
  cdnUrl: string | null
  mimeType: string
  originalFilename: string
}

/**
 * Multipart upload to POST /media/upload.
 * Separate from api() because the JSON Content-Type header must NOT be set
 * for FormData requests (the browser needs to set the multipart boundary).
 */
export async function uploadMedia(file: File): Promise<UploadedMedia> {
  const form = new FormData()
  form.append('file', file)

  const request = async (authToken?: string | null) =>
    fetch(`${BASE_URL}/media/upload`, {
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
