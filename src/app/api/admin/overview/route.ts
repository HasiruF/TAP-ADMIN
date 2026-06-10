import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/server/backendFetch'

export async function GET() {
  const res = await backendFetch('/admin/overview')
  if (!res.ok) {
    return NextResponse.json(
      { message: 'Failed to fetch overview' },
      { status: res.status }
    )
  }
  const data = await res.json()
  return NextResponse.json(data)
}
