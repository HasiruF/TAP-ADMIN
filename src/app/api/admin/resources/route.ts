import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/api/server/backendFetch'

export async function GET() {
  const res = await backendFetch('/admin/resources')
  if (!res.ok) {
    return NextResponse.json(
      { message: 'Failed to fetch resources' },
      { status: res.status }
    )
  }
  const data = await res.json()
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const body = await req.json()

  const res = await backendFetch('/admin/resources', {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json(
      { message: text || 'Failed to update resources' },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}
