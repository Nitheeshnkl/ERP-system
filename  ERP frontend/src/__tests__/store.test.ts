import { describe, it, expect } from 'vitest'
import { store } from '../app/store'
import { RootState } from '../app/store'

describe('Redux Store', () => {
  it('should initialize with correct initial state', () => {
    const state = store.getState() as RootState

    expect(state.auth).toBeDefined()
    expect(state.products).toBeDefined()
    expect(state.orders).toBeDefined()
    expect(state.dashboard).toBeDefined()
  })

  it('should have auth slice with correct initial state', () => {
    const state = store.getState() as RootState

    expect(state.auth.isAuthenticated).toBe(false)
    expect(state.auth.user).toBeNull()
    expect(state.auth.loading).toBe(true)
    expect(state.auth.error).toBeNull()
  })

  it('should have products slice with correct initial state', () => {
    const state = store.getState() as RootState

    expect(state.products.items).toEqual([])
    expect(state.products.loading).toBe(false)
    expect(state.products.error).toBeNull()
  })

  it('should have orders slice with correct initial state', () => {
    const state = store.getState() as RootState

    expect(state.orders.salesOrders).toEqual([])
    expect(state.orders.purchaseOrders).toEqual([])
    expect(state.orders.grns).toEqual([])
    expect(state.orders.invoices).toEqual([])
    expect(state.orders.loading).toBe(false)
    expect(state.orders.error).toBeNull()
  })

  it('should have dashboard slice with correct initial state', () => {
    const state = store.getState() as RootState

    expect(state.dashboard.metrics).toBeNull()
    expect(state.dashboard.chartData).toEqual([])
    expect(state.dashboard.loading).toBe(false)
    expect(state.dashboard.error).toBeNull()
  })
})
