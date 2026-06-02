import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const { email, password } = body

  // MOCK validation
  if (email !== 'admin@tap.com' || password !== '123456') {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }

  const res = NextResponse.json({
    user: {
      id: 'usr_1',
      name: 'Admin',
      email,
      role: 'admin',
    },
  })

  // httpOnly cookie
  res.cookies.set('token', 'mock-jwt-token', {
    httpOnly: true,
    secure: false, // set true in prod
    sameSite: 'lax',
    path: '/',
  })

  return res
}
