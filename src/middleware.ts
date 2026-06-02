import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  const isLoginPage = req.nextUrl.pathname.startsWith('/login')
  //not logged in
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  //logging in
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
