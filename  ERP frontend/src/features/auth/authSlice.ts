import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User } from '../../types/entities'
import axiosInstance from '../../services/axiosInstance'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    // First check if token exists in localStorage
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return rejectWithValue('No token')
    }

    // Verify token is still valid by calling /me endpoint
    const response = await axiosInstance.get('/auth/me')
    return response.data
  } catch (error: any) {
    localStorage.removeItem('auth_token')
    return rejectWithValue(error.response?.data?.message || 'Not authenticated')
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
      return response.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
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
      // Backend should return JWT token in response
      const token = response.data.token || response.data.user?.token
      if (token) {
        localStorage.setItem('auth_token', token)
      }
      return response.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.post('/auth/logout')
    localStorage.removeItem('auth_token')
    return null
  } catch (error: any) {
    // Clear token anyway even if logout request fails
    localStorage.removeItem('auth_token')
    return rejectWithValue(error.response?.data?.message || 'Logout failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
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
        state.loading = false
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false
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
        state.loading = false
      })
      .addCase(logout.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
