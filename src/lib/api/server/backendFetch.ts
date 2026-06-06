import { cookies } from 'next/headers'

const BACKEND_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3001/v1'

export async function backendFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })

  return res
}
