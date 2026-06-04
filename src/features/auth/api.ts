import { api } from '@/lib/api/client'
import { Authuser } from '@/types/authuser'

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api('/auth/email/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (): Promise<{ user: Authuser | null }> => api('/auth/me'),

  logout: () =>
    api('/auth/logout', {
      method: 'POST',
    }),
}
