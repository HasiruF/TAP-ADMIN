import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/server/backendFetch'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page') ?? '1'
  const limit = searchParams.get('limit') ?? '50'

  const res = await backendFetch(`/users?page=${page}&limit=${limit}`)
  if (!res.ok) {
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}
