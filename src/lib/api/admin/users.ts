const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchAdminUsers(page: number) {
  const token =
    typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1]
      : null

  const res = await fetch(`${BASE_URL}/users?page=${page}&limit=50`, {
    headers: {
      accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) throw new Error('Failed to fetch users')

  return res.json()
}
