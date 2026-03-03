import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { DashboardMetrics, ChartData } from '../../types/entities'
import axiosInstance from '../../services/axiosInstance'

interface DashboardState {
  metrics: DashboardMetrics | null
  chartData: ChartData[]
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  metrics: null,
  chartData: [],
  loading: false,
  error: null,
}

const unwrapApiData = (payload: any) => (payload && payload.data !== undefined ? payload.data : payload)

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/dashboard/metrics')
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics')
    }
  }
)

export const fetchChartData = createAsyncThunk(
  'dashboard/fetchChartData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/dashboard/chart')
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chart data')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchDashboardMetrics
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload || null
        state.loading = false
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch dashboard metrics'
        state.loading = false
      })

    // fetchChartData
    builder
      .addCase(fetchChartData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.chartData = Array.isArray(action.payload) ? action.payload : []
        state.loading = false
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch chart data'
        state.loading = false
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
