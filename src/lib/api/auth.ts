export interface RefreshResponse {
  token: string
  refreshToken: string
  tokenExpires: number
}

export async function refresh(): Promise<RefreshResponse> {
  const storedRefreshToken =
    typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('refreshToken='))
          ?.split('=')[1]
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

  // store new tokens
  document.cookie = `token=${data.token}; path=/;`
  document.cookie = `refreshToken=${data.refreshToken}; path=/;`

  return data
}
