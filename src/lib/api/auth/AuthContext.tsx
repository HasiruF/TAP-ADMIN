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

  setSession: (token: string, user: Authuser, refreshToken?: string) => void

  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    user: null as Authuser | null,
    accessToken: null as string | null,
    isAuthenticated: false,
  })

  const refreshAttempted = useRef(false)

  // Restore session after browser refresh
  useEffect(() => {
    if (refreshAttempted.current) return

    refreshAttempted.current = true

    refresh()
      .then(async (res) => {
        setAccessToken(res.token)

        localStorage.setItem('tap_refresh_token', res.refreshToken)

        const me = await authApi.me()

        setState({
          user: me.user,
          accessToken: res.token,
          isAuthenticated: true,
        })

        Cookies.set('tap_session', '1', {
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })

        if (me.user) {
          Cookies.set('tap_role', me.user.role, {
            path: '/',
            sameSite: 'lax',
          })
        }
      })
      .catch(() => {
        setAccessToken(null)

        localStorage.removeItem('tap_refresh_token')

        setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      })
  }, [])

  const setSession = useCallback(
    (token: string, user: Authuser, refreshToken?: string) => {
      // access token only lives in memory
      setAccessToken(token)

      // refresh token survives reload
      if (refreshToken) {
        localStorage.setItem('tap_refresh_token', refreshToken)
      }

      // middleware flags only
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
      })
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
    } finally {
      setAccessToken(null)

      localStorage.removeItem('tap_refresh_token')

      Cookies.remove('tap_session', {
        path: '/',
      })

      Cookies.remove('tap_role', {
        path: '/',
      })

      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      })

      window.location.href = '/login'
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
