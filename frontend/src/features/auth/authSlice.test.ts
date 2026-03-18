/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer, {
  checkAuth,
  login,
  logout,
  register,
  clearError,
  forceLogout,
} from './authSlice'
import axiosInstance from '../../services/axiosInstance'

jest.mock('../../services/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

const initialState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
}

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('returns initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('clears error', () => {
    const state = reducer({ ...initialState, error: 'bad' }, clearError())
    expect(state.error).toBeNull()
  })

  it('forceLogout resets auth state', () => {
    const state = reducer(
      {
        user: { id: '1' },
        isAuthenticated: true,
        initialized: false,
        loading: true,
        error: 'x',
      } as any,
      forceLogout()
    )
    expect(state.isAuthenticated).toBe(false)
    expect(state.initialized).toBe(true)
    expect(state.user).toBeNull()
    expect(state.error).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('checkAuth success dispatches fulfilled', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: { id: 'u1', name: 'Jane' } })

    const dispatch = jest.fn()
    const getState = jest.fn()

    const result: any = await checkAuth()(dispatch, getState, undefined)
    expect(result.type).toBe('auth/checkAuth/fulfilled')
    expect(axiosInstance.get).toHaveBeenCalledWith('/auth/me', { timeout: 7000 })
  })

  it('checkAuth failure clears token and rejects', async () => {
    localStorage.setItem('auth_token', 'token')
    ;(axiosInstance.get as jest.Mock).mockRejectedValue(new Error('nope'))

    const dispatch = jest.fn()
    const getState = jest.fn()

    const result: any = await checkAuth()(dispatch, getState, undefined)
    expect(result.type).toBe('auth/checkAuth/rejected')
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('login stores token and returns user', async () => {
    ;(axiosInstance.post as jest.Mock).mockResolvedValue({ data: { token: 't123', user: { id: '1' } } })

    const dispatch = jest.fn()
    const getState = jest.fn()
    const result: any = await login({ email: 'a@b.com', password: 'pw' })(dispatch, getState, undefined)

    expect(result.type).toBe('auth/login/fulfilled')
    expect(localStorage.getItem('auth_token')).toBe('t123')
  })

  it('logout clears token even on error', async () => {
    localStorage.setItem('auth_token', 't')
    ;(axiosInstance.post as jest.Mock).mockRejectedValue(new Error('fail'))

    const dispatch = jest.fn()
    const getState = jest.fn()
    const result: any = await logout()(dispatch, getState, undefined)

    expect(result.type).toBe('auth/logout/fulfilled')
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('register rejects on error', async () => {
    ;(axiosInstance.post as jest.Mock).mockRejectedValue(new Error('fail'))

    const dispatch = jest.fn()
    const getState = jest.fn()
    const result: any = await register({ name: 'A', email: 'a@b.com', password: 'pw', role: 'Admin' })(
      dispatch,
      getState,
      undefined
    )

    expect(result.type).toBe('auth/register/rejected')
  })
})
