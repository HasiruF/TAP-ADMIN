const BASE_URL = process.env.NEXT_PUBLIC_API_URL

import { refresh } from './auth'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

const isRefreshing = false
const queue: (() => void)[] = []

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

  let res = await request(accessToken)

  if (res.status === 401) {
    try {
      const newTokens = await refresh()

      setAccessToken(newTokens.token)

      console.log('REFRESH RESULT:', newTokens)

      res = await request(newTokens.token)
    } catch (err) {
      setAccessToken(null)
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
