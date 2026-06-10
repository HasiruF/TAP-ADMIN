import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/server/backendFetch'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // id is the userId — resolve to artistProfileId first
  const profilesRes = await backendFetch(`/admin/user/${id}/profiles`)
  if (!profilesRes.ok) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  const { artistProfileId } = await profilesRes.json()
  if (!artistProfileId) {
    return NextResponse.json(
      { message: 'No artist profile for this user' },
      { status: 404 }
    )
  }

  const profileRes = await backendFetch(
    `/admin/artist/profile/${artistProfileId}`
  )
  if (!profileRes.ok) {
    const text = await profileRes.text()
    return NextResponse.json(
      { message: text || 'Artist profile not found' },
      { status: profileRes.status }
    )
  }

  const data = await profileRes.json()
  return NextResponse.json(data)
}
