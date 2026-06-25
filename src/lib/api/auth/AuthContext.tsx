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

import { setAccessToken } from '../client'
import { refresh } from '../auth'
import { authApi } from '@/features/auth/api'

import type { Authuser } from '@/types/authuser'

interface AuthContextValue {
  user: Authuser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setSession: (token: string, user: Authuser, refreshToken?: string) => void

  logout: () => Promise<void>
}

/**
 * Session restoration flow:
 *
 * On application startup, the client checks for a stored refresh token
 * and attempts to restore the user's session.
 *
 * Security notes:
 * - Refresh tokens stored in localStorage can be compromised through XSS.
 * - Access tokens are intentionally kept in memory only and are cleared on logout.
 *
 * For higher-security environments:
 * - Backend should issue refresh tokens through HttpOnly Secure cookies.
 * - Session validation should be handled server-side.
 * - CSP and other XSS protections should be enabled.
 *
 * ⚠️ THREAT MODEL:
 * 1. XSS Attack → localStorage refresh token exposed → session hijacking
 *    MITIGATION: Move refresh token to HttpOnly cookie (requires backend change)
 * 2. CSRF Attack → tap_session cookie forged by attacker → false session state
 *    MITIGATION: Use SameSite=Lax/Strict and validate session on backend
 * 3. LocalStorage cleared by user → refresh token lost → forced logout
 *    MITIGATION: N/A - user choice to clear storage
 *
 * TODO: Add Content Security Policy (CSP) headers to app to reduce XSS surface
 * TODO: Implement server-side session validation as an additional layer
 */
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
  // from a stored refresh token. This allows the user to stay logged in across page reloads.
  useEffect(() => {
    if (refreshAttempted.current) return

    refreshAttempted.current = true

    refresh()
      .then(async (res) => {
        // ⚠️ Backend MUST return tokenExpires (in seconds) with refresh response
        // so the client can proactively refresh before 401 errors occur.
        // TODO: Add error handling if tokenExpires is missing from response
        setAccessToken(res.token, res.tokenExpires)

        localStorage.setItem('tap_refresh_token', res.refreshToken)

        // ⚠️ Fetch the current user info to populate user context
        const me = await authApi.me()

        setState({
          user: me.user,
          accessToken: res.token,
          isAuthenticated: true,
          isLoading: false, // Signal that auth hydration is complete
        })

        // ⚠️ tap_session is a marker cookie for middleware to check if user is logged in.
        // It is NOT a secure session token—just a flag. Backend must validate actual session server-side.
        // Secure flag only set in production to allow local development over HTTP.
        Cookies.set('tap_session', '1', {
          path: '/',
          sameSite: 'lax', // ⚠️ Prevents CSRF attacks while allowing same-site requests
          secure: process.env.NODE_ENV === 'production',
        })

        if (me.user) {
          // ⚠️ tap_role is a client-side convenience cookie for middleware route protections.
          // It should NOT be trusted on the backend—always validate user role server-side.
          Cookies.set('tap_role', me.user.role, {
            path: '/',
            sameSite: 'lax',
          })
        }
      })
      .catch(() => {
        // ⚠️ If refresh fails (no stored token, expired token, etc.), clear auth state
        // and set isLoading=false so the app can redirect to login
        setAccessToken(null)

        localStorage.removeItem('tap_refresh_token')
        Cookies.remove('tap_session')
        Cookies.remove('tap_role')
        setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      })
  }, [])

  // ⚠️ setSession is called after successful login to store the session in memory, localStorage, and cookies.
  // Do NOT call this during logout; use logout() instead to ensure all state is cleared.
  const setSession = useCallback(
    (token: string, user: Authuser, refreshToken?: string) => {
      // ⚠️ Access token lives ONLY in memory and is cleared on logout or page reload.
      // This prevents accidental exposure through localStorage/cookies.
      setAccessToken(token)

      // ⚠️ Refresh token is persisted in localStorage to allow session restoration after reload.
      // If backend changes to send refresh token in HttpOnly cookie, remove this line.
      if (refreshToken) {
        localStorage.setItem('tap_refresh_token', refreshToken)
      }

      // ⚠️ MIDDLEWARE FLAGS: These cookies are only for middleware route checks.
      // Do NOT trust them on the backend—always re-validate session server-side.
      Cookies.set('tap_session', '1', {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      Cookies.set('tap_role', user.role, {
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
      // ⚠️ TOTAL WIPEOUT: Clear ALL auth state from memory, localStorage, and cookies.
      // This ensures the user is fully logged out and cannot make authenticated requests.

      // Clear in-memory access token
      setAccessToken(null)

      // Clear refresh token stored for session restoration
      localStorage.removeItem('tap_refresh_token')

      // Clear session marker cookie
      Cookies.remove('tap_session', {
        path: '/',
      })

      // Clear role cookie
      Cookies.remove('tap_role', {
        path: '/',
      })

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
