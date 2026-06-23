'use client'
import { useEffect, useRef } from 'react'
import { refresh } from '../auth'
import React, { createContext, useCallback, useContext, useState } from 'react'

import Cookies from 'js-cookie'
import { setAccessToken } from '../client'
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

  const setSession = useCallback(
    (token: string, user: Authuser, refreshToken?: string) => {
      // access token only in memory
      setAccessToken(token)

      // refresh token persists
      if (refreshToken) {
        localStorage.setItem('tap_refresh_token', refreshToken)
      }

      // only presence flags
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
    setAccessToken(null)

    localStorage.removeItem('tap_refresh_token')

    Cookies.remove('tap_session')
    Cookies.remove('tap_role')

    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })

    window.location.href = '/login'
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
