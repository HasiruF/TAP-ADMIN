import { api, setAccessToken } from '@/lib/api/client'
import { refresh } from '@/lib/api/auth'

jest.mock('@/lib/api/auth', () => ({
  refresh: jest.fn(),
}))

describe('API refresh lock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setAccessToken('expired-token')
  })

  it('only calls refresh once for concurrent 401 requests', async () => {
    ;(refresh as jest.Mock).mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh',
      tokenExpires: 3600,
    })

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      })
      .mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          success: true,
        }),
      })

    await Promise.all([api('/test1'), api('/test2'), api('/test3')])

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('retries request after refresh succeeds', async () => {
    ;(refresh as jest.Mock).mockResolvedValue({
      token: 'new-token',
      refreshToken: 'new-refresh',
      tokenExpires: 3600,
    })

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          message: 'success',
        }),
      })

    const result = await api('/profile')

    expect(result.message).toBe('success')

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
