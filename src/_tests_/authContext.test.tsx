import { render, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/lib/api/auth/AuthContext'
import * as auth from '@/lib/api/auth'

import '@testing-library/jest-dom'

jest.mock('@/lib/api/auth')

describe('AuthContext initialization', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('restores session when refresh token exists', async () => {
    localStorage.setItem('tap_refresh_token', 'refresh-token')

    jest.spyOn(auth, 'refresh').mockResolvedValue({
      token: 'access-token',
      refreshToken: 'new-refresh',
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
})
