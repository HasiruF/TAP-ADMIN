import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/server/backendFetch'

export async function GET() {
  const res = await backendFetch('/admin/moderation')
  if (!res.ok) {
    return NextResponse.json(
      { message: 'Failed to fetch moderation queue' },
      { status: res.status }
    )
  }
  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { action, contentModId } = body

  const endpoint =
    action === 'approve'
      ? '/admin/moderation/approve'
      : '/admin/moderation/reject'

  const res = await backendFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ contentModId }),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json(
      { message: text || 'Moderation action failed' },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}
