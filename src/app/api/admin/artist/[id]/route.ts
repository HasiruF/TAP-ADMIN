import { NextResponse } from 'next/server'
import { artists } from '@/data_mock/artists'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const artist = artists.find((a) => a.id === id)

  if (!artist) {
    return NextResponse.json({ message: 'Artist not found' }, { status: 404 })
  }

  return NextResponse.json(artist)
}
