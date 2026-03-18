import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import PurchaseOrders from '../pages/PurchaseOrders'
import { renderWithProviders } from '../test-utils'

const fetchPurchaseOrdersMock = jest.fn(() => ({ type: 'orders/fetchPurchaseOrders' }))
const clearErrorMock = jest.fn(() => ({ type: 'orders/clearError' }))
const createPurchaseOrderMock = jest.fn(() => ({ type: 'orders/createPurchaseOrder' }))
const updatePurchaseOrderMock = jest.fn(() => ({ type: 'orders/updatePurchaseOrder' }))
const deletePurchaseOrderMock = jest.fn(() => ({ type: 'orders/deletePurchaseOrder' }))

jest.mock('../features/orders/ordersSlice', () => {
  const actual = jest.requireActual('../features/orders/ordersSlice')
  return {
    __esModule: true,
    ...actual,
    fetchPurchaseOrders: (...args: any[]) => fetchPurchaseOrdersMock(...args),
    clearError: (...args: any[]) => clearErrorMock(...args),
    createPurchaseOrder: (...args: any[]) => createPurchaseOrderMock(...args),
    updatePurchaseOrder: (...args: any[]) => updatePurchaseOrderMock(...args),
    deletePurchaseOrder: (...args: any[]) => deletePurchaseOrderMock(...args),
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

describe('PurchaseOrders page', () => {
  const baseState = {
    orders: { salesOrders: [], purchaseOrders: [], grns: [], invoices: [], loading: false, error: null },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows New PO for Purchase role', () => {
    renderWithProviders(<PurchaseOrders />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Purchase', email: 'p@x.com', role: 'Purchase' }, loading: false, initialized: true, error: null },
      },
    })
    expect(screen.getByRole('button', { name: /new po/i })).toBeInTheDocument()
  })

  it('disables save when supplier missing', () => {
    renderWithProviders(<PurchaseOrders />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Purchase', email: 'p@x.com', role: 'Purchase' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /new po/i }))
    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toBeDisabled()
  })

  it('opens edit dialog for existing order', () => {
    const order = {
      id: 'p1',
      poNumber: 'PO-1',
      supplierId: { _id: 's1', name: 'Vendor' },
      items: [{ _id: 'i1', productId: { _id: 'p1', name: 'Bolt' }, quantity: 1, unitPrice: 10 }],
      status: 'Pending',
    }

    renderWithProviders(<PurchaseOrders />, {
      preloadedState: {
        ...baseState,
        orders: { ...baseState.orders, purchaseOrders: [order] },
        auth: { isAuthenticated: true, user: { id: '1', name: 'Admin', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByTitle(/edit/i))
    expect(screen.getByText(/edit purchase order/i)).toBeInTheDocument()
  })
})
