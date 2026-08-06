import { setAccessToken } from './client'

export interface RefreshResponse {
  token: string
  tokenExpires: number
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot/password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  )

  if (!res.ok) {
    throw new Error('Failed to send password reset email')
  }
}

export async function refresh(): Promise<RefreshResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Refresh failed')
  }

  const data = await res.json()

  // access token stays only in memory; the refresh token lives in an
  // httpOnly cookie the backend set on this response — nothing to store here.
  setAccessToken(data.token)

  return data
}
