import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi } from './api'
import { Authuser } from '@/types/authuser'

export function useMe() {
  return useQuery<{ user: Authuser | null }>({
    queryKey: ['me'],
    queryFn: authApi.me,
    retry: false,
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  })
}
