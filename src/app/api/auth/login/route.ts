import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3001/v1'

export async function POST(req: Request) {
  const body = await req.json()

  const backendRes = await fetch(`${BACKEND_URL}/auth/email/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!backendRes.ok) {
    const text = await backendRes.text()
    try {
      return NextResponse.json(JSON.parse(text), { status: backendRes.status })
    } catch {
      return NextResponse.json(
        { message: text || 'Invalid credentials' },
        { status: backendRes.status }
      )
    }
  }

  const data = await backendRes.json()
  return NextResponse.json(data)
}
