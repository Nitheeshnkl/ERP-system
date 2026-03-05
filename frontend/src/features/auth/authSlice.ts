import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User } from '../../types/entities'
import axiosInstance from '../../services/axiosInstance'
import { getErrorMessage } from '../../utils/errorUtils'

const TOKEN_KEY = 'auth_token'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  initialized: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
}

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/auth/me', { timeout: 7_000 })
    return response.data
  } catch (error: unknown) {
    localStorage.removeItem(TOKEN_KEY)
    return rejectWithValue(getErrorMessage(error) || 'Not authenticated')
  }
})

export const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password, role }: { name: string; email: string; password: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/auth/register', { name, email, password, role })
      return response.data
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || 'Registration failed')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password })
      const token = response.data?.token
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      }
      return response.data.user
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await axiosInstance.post('/auth/logout')
    localStorage.removeItem(TOKEN_KEY)
    return null
  } catch (error: unknown) {
    localStorage.removeItem(TOKEN_KEY)
    // Logout must be idempotent on the client: clear local auth even if server call fails.
    return null
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    forceLogout(state) {
      state.user = null
      state.isAuthenticated = false
      state.initialized = true
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    // checkAuth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.initialized = true
        state.loading = false
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.initialized = true
        state.loading = false
      })

    // register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })

    // login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })

    // logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
        state.loading = false
      })
      .addCase(logout.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
      })
  },
})

export const { clearError, forceLogout } = authSlice.actions
export default authSlice.reducer
