import authReducer, { clearError, forceLogout } from '../features/auth/authSlice'
import productsReducer, { setSearchFilter, setLowStockFilter } from '../features/products/productsSlice'
import dashboardReducer, { clearError as clearDashboardError } from '../features/dashboard/dashboardSlice'

describe('Slice reducers', () => {
  it('auth forceLogout clears state', () => {
    const state: any = { user: { id: '1' }, isAuthenticated: true, initialized: false, loading: true, error: 'x' }
    const next = authReducer(state, forceLogout())
    expect(next.user).toBeNull()
    expect(next.isAuthenticated).toBe(false)
    expect(next.initialized).toBe(true)
  })

  it('products search and low stock filters update', () => {
    const initial: any = { items: [], loading: false, error: null, filters: { search: '', lowStockOnly: false } }
    const next = productsReducer(initial, setSearchFilter('abc'))
    expect(next.filters.search).toBe('abc')
    const next2 = productsReducer(next, setLowStockFilter(true))
    expect(next2.filters.lowStockOnly).toBe(true)
  })

  it('dashboard clearError resets error', () => {
    const initial: any = { metrics: null, chartData: [], loading: false, error: 'boom' }
    const next = dashboardReducer(initial, clearDashboardError())
    expect(next.error).toBeNull()
  })
})
