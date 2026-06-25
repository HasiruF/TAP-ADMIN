const BASE_URL = process.env.NEXT_PUBLIC_API_URL
import Cookies from 'js-cookie'
import { refresh, RefreshResponse } from './auth'
/**
 * Authentication security considerations:
 *
 * Access tokens are stored only in memory to reduce exposure through browser storage.
 *
 * Current refresh token approach:
 * - Refresh token is stored in localStorage to allow session restoration after page reload.
 *
 * Security risks:
 * - localStorage is accessible by JavaScript, meaning an XSS vulnerability could expose
 *   the refresh token and allow session hijacking.
 * - The client-managed tap_session cookie should not be considered a trusted server session
 *   because it can be modified by the client.
 *
 * Recommended production improvements:
 * - Store refresh tokens using HttpOnly, Secure, SameSite cookies.
 * - Use server-managed sessions instead of trusting client-set session cookies.
 * - Add Content Security Policy (CSP) headers to reduce XSS attack surface.
 * - Validate session state server-side.
 */
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
      const newTokens = await refreshWithLock()

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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tap_refresh_token')
      }
      Cookies.remove('tap_session')
      Cookies.remove('tap_role')
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
