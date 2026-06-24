const BASE_URL = process.env.NEXT_PUBLIC_API_URL

import { refresh, RefreshResponse } from './auth'

let accessToken: string | null = null
let tokenExpiresAt: number | null = null

export function setAccessToken(token: string | null, tokenExpires?: number) {
  accessToken = token

  if (token && tokenExpires) {
    tokenExpiresAt = Date.now() + tokenExpires * 1000
  } else {
    tokenExpiresAt = null
  }
}

export function getAccessToken() {
  return accessToken
}
let refreshPromise: Promise<RefreshResponse> | null = null

async function refreshWithLock() {
  if (!refreshPromise) {
    refreshPromise = refresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

function isTokenExpired() {
  if (!tokenExpiresAt) return false

  return Date.now() >= tokenExpiresAt
}

export async function api(path: string, options: RequestInit = {}) {
  const request = async (authToken?: string | null) => {
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      },
    })
  }

  if (isTokenExpired()) {
    try {
      const newTokens = await refresh()

      setAccessToken(newTokens.token, newTokens.tokenExpires)
    } catch {
      setAccessToken(null)
      throw new Error('Session expired')
    }
  }
  let res = await request(accessToken)

  if (res.status === 401) {
    try {
      const newTokens = await refreshWithLock()

      setAccessToken(newTokens.token, newTokens.tokenExpires)

      res = await request(newTokens.token)
    } catch (err) {
      setAccessToken(null)
      localStorage.removeItem('tap_refresh_token')

      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const text = await res.text()

    try {
      throw JSON.parse(text)
    } catch {
      throw new Error(text || 'API Error')
    }
  }

  return res.json()
}
