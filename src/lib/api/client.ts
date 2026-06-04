const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function api(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1]
      : null

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

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
