import { api } from '@/lib/api/client'
import { Authuser } from '@/types/authuser'

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api('/auth/email/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: async (): Promise<{ user: Authuser | null }> => {
    try {
      const user = await api('/auth/me')
      return {
        user: {
          id: user.id,
          name:
            `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
            user.email,
          email: user.email,
          role: (user.role?.name ?? 'admin').toLowerCase() as Authuser['role'],
        },
      }
    } catch {
      return { user: null }
    }
  },

  logout: () =>
    api('/auth/logout', {
      method: 'POST',
    }),
}
