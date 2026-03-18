import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import SalesOrders from '../pages/SalesOrders'
import { renderWithProviders } from '../test-utils'

const fetchSalesOrdersMock = jest.fn(() => ({ type: 'orders/fetchSalesOrders' }))
const clearErrorMock = jest.fn(() => ({ type: 'orders/clearError' }))
const createSalesOrderMock = jest.fn(() => ({ type: 'orders/createSalesOrder' }))
const updateSalesOrderMock = jest.fn(() => ({ type: 'orders/updateSalesOrder' }))
const deleteSalesOrderMock = jest.fn(() => ({ type: 'orders/deleteSalesOrder' }))

jest.mock('../features/orders/ordersSlice', () => {
  const actual = jest.requireActual('../features/orders/ordersSlice')
  return {
    __esModule: true,
    ...actual,
    fetchSalesOrders: (...args: any[]) => fetchSalesOrdersMock(...args),
    clearError: (...args: any[]) => clearErrorMock(...args),
    createSalesOrder: (...args: any[]) => createSalesOrderMock(...args),
    updateSalesOrder: (...args: any[]) => updateSalesOrderMock(...args),
    deleteSalesOrder: (...args: any[]) => deleteSalesOrderMock(...args),
  }
})

jest.mock('../components/shared/EntitySelect', () => (props: any) => (
  <input
    aria-label={`${props.entityType}-select`}
    value={props.value}
    onChange={(e) => props.onChange(e.target.value)}
  />
))

jest.mock('../components/shared/QuickCreateModal', () => (props: any) => (
  <div>{props.open ? 'QuickCreateOpen' : null}</div>
))

describe('SalesOrders page', () => {
  const baseState = {
    orders: { salesOrders: [], purchaseOrders: [], grns: [], invoices: [], loading: false, error: null },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows New SO for Sales role', () => {
    renderWithProviders(<SalesOrders />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Sales', email: 's@x.com', role: 'Sales' }, loading: false, initialized: true, error: null },
      },
    })
    expect(screen.getByRole('button', { name: /new so/i })).toBeInTheDocument()
  })

  it('disables save when customer missing', () => {
    renderWithProviders(<SalesOrders />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Sales', email: 's@x.com', role: 'Sales' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /new so/i }))
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('opens edit dialog for existing order', () => {
    const order = {
      id: 'o1',
      orderNumber: 'SO-1',
      customerId: { _id: 'c1', name: 'Client' },
      items: [{ _id: 'i1', productId: { _id: 'p1', name: 'Bolt' }, quantity: 1, unitPrice: 10 }],
      status: 'Pending',
    }

    renderWithProviders(<SalesOrders />, {
      preloadedState: {
        ...baseState,
        orders: { ...baseState.orders, salesOrders: [order] },
        auth: { isAuthenticated: true, user: { id: '1', name: 'Admin', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByTitle(/edit/i))
    expect(screen.getByText(/edit sales order/i)).toBeInTheDocument()
  })
})
