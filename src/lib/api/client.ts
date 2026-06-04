const BASE_URL = process.env.NEXT_PUBLIC_API_URL
import { refresh } from './auth'

const isRefreshing = false
const queue: (() => void)[] = []

export async function api(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1]
      : null

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

  let res = await request(token)

  if (res.status === 401) {
    try {
      const newTokens = await refresh()

      document.cookie = `token=${newTokens.token}; path=/;`
      console.log('REFRESH RESULT:', newTokens)
      // retry original request with new token
      res = await request(newTokens.token)
    } catch (err) {
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
