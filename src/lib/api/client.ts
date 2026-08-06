const BASE_URL = process.env.NEXT_PUBLIC_API_URL
import Cookies from 'js-cookie'
import { refresh, RefreshResponse } from './auth'
let accessToken: string | null = null
let tokenExpiresAt: number | null = null

export function setAccessToken(token: string | null, tokenExpires?: number) {
  accessToken = token

  if (token && tokenExpires) {
    tokenExpiresAt = tokenExpires //epoch milliseconds
  } else {
    tokenExpiresAt = null
  }
}

export function getAccessToken() {
  return accessToken
}

/**
 * Clears ALL client-side auth state: the in-memory access token and the
 * middleware marker cookies. The refresh token itself lives in an httpOnly
 * cookie set by the backend and is cleared server-side by POST /auth/logout —
 * this function has no access to it and must not try to.
 */
export function clearAuthState() {
  setAccessToken(null)

  Cookies.remove('tap_admin_session', { path: '/' })
  Cookies.remove('tap_admin_role', { path: '/' })
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      },
    })
  }

  if (isTokenExpired()) {
    try {
      const newTokens = await refreshWithLock()

      setAccessToken(newTokens.token, newTokens.tokenExpires)
    } catch {
      clearAuthState()
      throw new Error('Session expired')
    }
  }
  let res = await request(accessToken)

  if (res.status === 401) {
    try {
      const newTokens = await refreshWithLock()

      setAccessToken(newTokens.token, newTokens.tokenExpires)

      res = await request(newTokens.token)
    } catch {
      clearAuthState()
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const text = await res.text()
    let parsed: unknown

    try {
      parsed = JSON.parse(text)
    } catch {
      throw new Error(text || 'API Error')
    }

    throw parsed
  }

  // 204s and empty-body 200s (e.g. void-returning DELETE endpoints) have no
  // JSON to parse — calling res.json() on them throws, which would make an
  // otherwise-successful request register as a failed mutation.
  if (res.status === 204) return undefined
  const text = await res.text()
  if (!text) return undefined
  return JSON.parse(text)
}
