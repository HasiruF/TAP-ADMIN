import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Named distinctly from tap-fe's tap_session/tap_role: both apps' cookies
// share the same host (cookies aren't port- or subdomain-scoped between
// api./app./admin. the way you'd expect), so identically-named marker
// cookies would clobber each other when both apps are logged into in the
// same browser. Verified live: an admin login's tap_role='admin' write
// silently overwrote an artist session's tap_role='artist' in another tab,
// bouncing the artist session's middleware checks.
export function middleware(req: NextRequest) {
  const session = req.cookies.get('tap_admin_session')?.value
  const role = req.cookies.get('tap_admin_role')?.value

  // This is the admin console: a valid session is not enough — only the admin
  // role may reach /admin/*. The tap_role cookie is client-set and therefore
  // not trustworthy on its own; the backend still enforces @Roles(admin) on
  // every admin endpoint. This is the UI-level gate on top of that.
  const isAdmin = Boolean(session) && role === 'admin'

  const isLoginPage = req.nextUrl.pathname.startsWith('/login')

  // Anyone who is not an authenticated admin gets bounced to the login page.
  if (!isAdmin && !isLoginPage) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    // Clear any stale/non-admin marker cookies so we don't ping-pong between
    // /login (which sends sessions to /admin) and /admin (which sends
    // non-admins back to /login).
    if (session) {
      res.cookies.delete('tap_admin_session')
      res.cookies.delete('tap_admin_role')
    }
    return res
  }

  // Authenticated admin landing on the login page → straight to the dashboard.
  if (isAdmin && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
