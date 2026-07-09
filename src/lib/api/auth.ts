import { setAccessToken } from './client'

export interface RefreshResponse {
  token: string
  refreshToken: string
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
  const storedRefreshToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('tap_refresh_token')
      : null

  if (!storedRefreshToken) {
    throw new Error('No refresh token found')
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storedRefreshToken}`,
    },
  })

  if (!res.ok) {
    throw new Error('Refresh failed')
  }

  const data = await res.json()

  // access token stays only in memory
  setAccessToken(data.token)

  // refresh token persists for reloads
  localStorage.setItem('tap_refresh_token', data.refreshToken)

  return data
}
