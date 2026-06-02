import { api } from '@/lib/api/client'
import { Authuser } from '@/types/authuser'
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (): Promise<{ user: Authuser | null }> => api('/api/auth/me'),

  logout: () =>
    api('/api/auth/logout', {
      method: 'POST',
    }),
}
