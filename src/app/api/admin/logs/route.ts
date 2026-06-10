import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/server/backendFetch'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  const query = userId ? `?userId=${userId}` : ''
  const res = await backendFetch(`/admin/logs${query}`)

  if (!res.ok) {
    return NextResponse.json(
      { message: 'Failed to fetch logs' },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}
