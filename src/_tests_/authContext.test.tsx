import { render, waitFor, renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '@/lib/api/auth/AuthContext'
import * as auth from '@/lib/api/auth'

import '@testing-library/jest-dom'

jest.mock('@/lib/api/auth', () => ({
  logout: jest.fn(),
  refresh: jest.fn(),
}))

describe('AuthContext initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('restores session via the refresh-token cookie', async () => {
    jest.spyOn(auth, 'refresh').mockResolvedValue({
      token: 'access-token',
      tokenExpires: 3600,
    })

    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(auth.refresh).toHaveBeenCalled()
    })
  })
  describe('AuthContext logout', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('clears all auth state on logout', async () => {
      jest
        .spyOn(auth, 'refresh')
        .mockRejectedValue(new Error('No refresh token'))

      const { result } = renderHook(() => useAuthContext(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()

      expect(result.current.isAuthenticated).toBe(false)

      expect(result.current.isLoading).toBe(false)
    })
  })
})
