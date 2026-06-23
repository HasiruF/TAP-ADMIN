import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const session = req.cookies.get('tap_session')?.value

  const isLoginPage = req.nextUrl.pathname.startsWith('/login')

  // not logged in
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // already logged in
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
