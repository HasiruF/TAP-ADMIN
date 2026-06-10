import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/server/backendFetch'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const artistId = searchParams.get('artistId')
  const venueId = searchParams.get('venueId')

  const params = new URLSearchParams()
  if (artistId) params.set('artistId', artistId)
  if (venueId) params.set('venueId', venueId)

  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await backendFetch(`/admin/conversations${query}`)

  if (!res.ok) {
    return NextResponse.json(
      { message: 'Failed to fetch conversations' },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}
