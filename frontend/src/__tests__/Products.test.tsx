import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import Products from '../pages/Products'
import { renderWithProviders } from '../test-utils'

const fetchProductsMock = jest.fn(() => ({ type: 'products/fetchProducts' }))
const createProductMock = jest.fn(() => ({ type: 'products/createProduct' }))
const updateProductMock = jest.fn(() => ({ type: 'products/updateProduct' }))
const deleteProductMock = jest.fn(() => ({ type: 'products/deleteProduct' }))
const setSearchFilterMock = jest.fn((value: string) => ({ type: 'products/setSearchFilter', payload: value }))
const clearErrorMock = jest.fn(() => ({ type: 'products/clearError' }))

jest.mock('../features/products/productsSlice', () => {
  const actual = jest.requireActual('../features/products/productsSlice')
  return {
    __esModule: true,
    ...actual,
    fetchProducts: (...args: any[]) => fetchProductsMock(...args),
    createProduct: (...args: any[]) => createProductMock(...args),
    updateProduct: (...args: any[]) => updateProductMock(...args),
    deleteProduct: (...args: any[]) => deleteProductMock(...args),
    setSearchFilter: (...args: any[]) => setSearchFilterMock(...args),
    clearError: (...args: any[]) => clearErrorMock(...args),
  }
})

jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: any) => (
    <div>
      {rows.map((row: any) => (
        <div key={row.id}>
          {columns.map((col: any) => (
            <div key={col.field}>
              {col.renderCell ? col.renderCell({ row, value: row[col.field] }) : row[col.field]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}))

describe('Products page', () => {
  const baseState = {
    products: { items: [], loading: false, error: null, filters: { search: '', lowStockOnly: false } },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(window as any).confirm = jest.fn(() => true)
  })

  it('hides Add Product for non-inventory roles', () => {
    renderWithProviders(<Products />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Sales', email: 's@x.com', role: 'Sales' }, loading: false, initialized: true, error: null },
      },
    })
    expect(screen.queryByRole('button', { name: /add product/i })).toBeNull()
  })

  it('shows validation error when saving empty form', () => {
    renderWithProviders(<Products />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Admin', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /add product/i }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByText(/name and sku are required/i)).toBeInTheDocument()
  })

  it('creates a product and dispatches search filter', () => {
    renderWithProviders(<Products />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Admin', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.change(screen.getByLabelText(/search by name or sku/i), { target: { value: 'bolt' } })
    expect(setSearchFilterMock).toHaveBeenCalledWith('bolt')

    fireEvent.click(screen.getByRole('button', { name: /add product/i }))
    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: 'Bolt' } })
    fireEvent.change(screen.getByLabelText(/^sku$/i), { target: { value: 'B-1' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(createProductMock).toHaveBeenCalled()
  })

  it('renders row actions and deletes a product', () => {
    renderWithProviders(<Products />, {
      preloadedState: {
        products: { items: [{ id: 'p1', name: 'Bolt', sku: 'B-1', stock: 2, reorderLevel: 1 }], loading: false, error: null, filters: { search: '', lowStockOnly: false } },
        auth: { isAuthenticated: true, user: { id: '1', name: 'Admin', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(deleteProductMock).toHaveBeenCalledWith('p1')
  })
})
