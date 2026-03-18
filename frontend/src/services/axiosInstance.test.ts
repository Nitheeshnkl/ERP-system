/* eslint-disable @typescript-eslint/no-explicit-any */

const loadModule = async () => {
  jest.resetModules()
  const requestUse = jest.fn()
  const responseUse = jest.fn()
  const mockAxiosInstance = {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  }

  jest.doMock('axios', () => ({
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
      isAxiosError: jest.fn(() => true),
    },
  }))

  const axios = (await import('axios')).default as any
  await import('./axiosInstance.ts')

  return { axios, requestUse, responseUse }
}

describe('axiosInstance', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})

  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates axios instance with normalized base URL', async () => {
    const { axios } = await loadModule()
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '/api',
        withCredentials: true,
        timeout: 10000,
      })
    )
  })

  it('adds auth header and logs request', async () => {
    localStorage.setItem('auth_token', 'token123')
    const { requestUse } = await loadModule()

    const requestInterceptor = requestUse.mock.calls[0][0]
    const config: any = { method: 'get', baseURL: '/api', url: '/products' }

    const nextConfig = requestInterceptor(config)
    expect(nextConfig.headers.Authorization).toBe('Bearer token123')
    expect(console.log).toHaveBeenCalledWith('[API] GET /api/products')
  })

  it('unwraps successful response payloads', async () => {
    const { responseUse } = await loadModule()
    const responseInterceptor = responseUse.mock.calls[0][0]

    const response = {
      data: { success: true, data: { id: '1' }, message: 'ok', meta: { total: 1 } },
    }

    const next = responseInterceptor(response)
    expect(next.data).toEqual({ id: '1' })
    expect(next.message).toBe('ok')
    expect(next.meta).toEqual({ total: 1 })
  })

  it('rejects when success flag is false', async () => {
    const { responseUse } = await loadModule()
    const responseInterceptor = responseUse.mock.calls[0][0]

    const response = { data: { success: false, message: 'nope' } }
    await expect(responseInterceptor(response)).rejects.toBe(response)
  })

  it('handles timeout errors and 401 unauthorized', async () => {
    const { responseUse } = await loadModule()
    const errorInterceptor = responseUse.mock.calls[0][1]

    const timeoutError: any = { code: 'ECONNABORTED' }
    await expect(errorInterceptor(timeoutError)).rejects.toBe(timeoutError)
    expect(console.error).toHaveBeenCalledWith('[API ERROR]', 'Request timed out after 10000ms')

    const authEvent = jest.fn()
    window.addEventListener('auth:unauthorized', authEvent)

    localStorage.setItem('auth_token', 'tkn')
    const authError: any = { response: { status: 401 }, config: {} }
    await expect(errorInterceptor(authError)).rejects.toBe(authError)

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(authEvent).toHaveBeenCalled()

    window.removeEventListener('auth:unauthorized', authEvent)
  })
})
