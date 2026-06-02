'use client'

import { createContext, useContext } from 'react'
import { useMe } from './hooks'
import { Authuser } from '@/types/authuser'
const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useMe()

  return (
    <AuthContext.Provider
      value={{
        user: data?.user,
        isLoading,
        isAuthenticated: !!data?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
