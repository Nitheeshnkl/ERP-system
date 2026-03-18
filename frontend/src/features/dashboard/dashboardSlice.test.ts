/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer, { fetchDashboardMetrics, fetchChartData, clearError } from './dashboardSlice'
import axiosInstance from '../../services/axiosInstance'

jest.mock('../../services/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))

describe('dashboardSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('clears error', () => {
    const state = reducer({ metrics: null, chartData: [], loading: false, error: 'x' } as any, clearError())
    expect(state.error).toBeNull()
  })

  it('fetchDashboardMetrics fulfilled sets metrics', () => {
    const metrics = { totalSales: 10 }
    const state = reducer(undefined as any, fetchDashboardMetrics.fulfilled(metrics as any, '', undefined))
    expect(state.metrics).toEqual(metrics)
    expect(state.loading).toBe(false)
  })

  it('fetchChartData thunk calls API', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] })
    const dispatch = jest.fn()
    const getState = jest.fn()

    const result: any = await fetchChartData()(dispatch, getState, undefined)
    expect(result.type).toBe('dashboard/fetchChartData/fulfilled')
    expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/chart')
  })
})
