'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import Cookies from 'js-cookie'

import { setAccessToken, clearAuthState } from '../client'
import { refresh } from '../auth'
import { authApi } from '@/features/auth/api'

import type { Authuser } from '@/types/authuser'

interface AuthContextValue {
  user: Authuser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setSession: (token: string, user: Authuser, tokenExpires?: number) => void

  logout: () => Promise<void>
}

// Refresh token lives in an httpOnly cookie set by the backend — this file
// never sees it. Session restoration on app boot works by calling refresh(),
// which relies on the browser sending that cookie automatically.
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as Authuser | null,
    accessToken: null as string | null,
    isAuthenticated: false,
    // ⚠️ isLoading is true until the app attempts to restore the user session on first load.
    // This prevents protected queries from running before we know if the user is authenticated.
    isLoading: true,
  })

  // ⚠️ useRef ensures that session restoration only happens once, even if AuthProvider is wrapped
  // by StrictMode or other effects that cause the component to render twice during development.
  const refreshAttempted = useRef(false)

  // ⚠️ SESSION RESTORATION: On first app load, attempt to restore the user's session
  // via the httpOnly refresh-token cookie. This allows the user to stay logged in across page reloads.
  useEffect(() => {
    if (refreshAttempted.current) return

    refreshAttempted.current = true

    refresh()
      .then(async (res) => {
        // ⚠️ Backend MUST return tokenExpires (in seconds) with refresh response
        // so the client can proactively refresh before 401 errors occur.
        // TODO: Add error handling if tokenExpires is missing from response
        setAccessToken(res.token, res.tokenExpires)

        // ⚠️ Fetch the current user info to populate user context
        const me = await authApi.me()

        // Admin console: only admin accounts may hold a session here. If a
        // non-admin refresh token is ever restored, discard it rather than
        // re-establishing the marker cookies (which would fight the middleware
        // gate and briefly expose the admin shell).
        if (me.user?.role !== 'admin') {
          clearAuthState()
          setState({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return
        }

        setState({
          user: me.user,
          accessToken: res.token,
          isAuthenticated: true,
          isLoading: false, // Signal that auth hydration is complete
        })

        // ⚠️ tap_admin_session is a marker cookie for middleware to check if user is logged in.
        // It is NOT a secure session token—just a flag. Backend must validate actual session server-side.
        // Secure flag only set in production to allow local development over HTTP.
        // Named distinctly from tap-fe's tap_session — both apps share a cookie
        // host, so identically-named cookies would clobber each other.
        Cookies.set('tap_admin_session', '1', {
          path: '/',
          sameSite: 'lax', // ⚠️ Prevents CSRF attacks while allowing same-site requests
          secure: process.env.NODE_ENV === 'production',
        })

        if (me.user) {
          // ⚠️ tap_admin_role is a client-side convenience cookie for middleware route protections.
          // It should NOT be trusted on the backend—always validate user role server-side.
          Cookies.set('tap_admin_role', me.user.role, {
            path: '/',
            sameSite: 'lax',
          })
        }
      })
      .catch(() => {
        // ⚠️ If refresh fails (no stored token, expired token, etc.), clear auth state
        // and set isLoading=false so the app can redirect to login
        clearAuthState()

        setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      })
  }, [])

  // ⚠️ setSession is called after successful login to store the session in memory and set the marker cookies.
  // Do NOT call this during logout; use logout() instead to ensure all state is cleared.
  const setSession = useCallback(
    (token: string, user: Authuser, tokenExpires?: number) => {
      // ⚠️ Access token lives ONLY in memory and is cleared on logout or page reload.
      // This prevents accidental exposure through localStorage/cookies.
      // ⚠️ tokenExpires (absolute epoch ms from the backend) lets the client
      // proactively refresh before the token 401s; without it the first refresh
      // only happens reactively after a 401.
      setAccessToken(token, tokenExpires)

      // ⚠️ MIDDLEWARE FLAGS: These cookies are only for middleware route checks.
      // Do NOT trust them on the backend—always re-validate session server-side.
      // Named distinctly from tap-fe's tap_session/tap_role — see middleware.ts.
      Cookies.set('tap_admin_session', '1', {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      Cookies.set('tap_admin_role', user.role, {
        path: '/',
        sameSite: 'lax',
      })

      setState({
        user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      })
    },
    []
  )

  // ⚠️ logout() clears ALL auth state but does NOT navigate.
  // Callers must handle navigation to /login after calling logout().
  // This separation allows logout to be called from different contexts (sidebar, API error handler, etc.)
  // without forcing a specific navigation pattern.
  const logout = useCallback(async () => {
    try {
      // ⚠️ Call the backend logout endpoint to invalidate the session server-side.
      // Do NOT skip this call; it ensures the refresh token is revoked.
      await authApi.logout()
    } catch {
      // Even if the backend logout fails, proceed with local cleanup (network error, etc.)
    } finally {
      // ⚠️ TOTAL WIPEOUT: Clear ALL auth state from memory and the marker cookies
      // (the refresh-token cookie itself is cleared server-side by authApi.logout()).
      // This ensures the user is fully logged out and cannot make authenticated requests.
      clearAuthState()

      // Reset auth context to logged-out state
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuthContext must be used inside AuthProvider')
  }

  return ctx
}
