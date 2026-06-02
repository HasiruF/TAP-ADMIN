import { NextResponse } from 'next/server'
import { venues } from '@/data_mock/venues'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const venue = venues.find((v) => v.id === id)

  if (!venue) {
    return NextResponse.json({ message: 'Venue not found' }, { status: 404 })
  }

  return NextResponse.json(venue)
}
