import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import authReducer from '../features/auth/authSlice'
import ordersReducer from '../features/orders/ordersSlice'
import SalesOrders from '../pages/SalesOrders'
import axiosInstance from '../services/axiosInstance'

vi.mock('../services/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('../components/shared/EntitySelect', () => ({
  default: ({ entityType, value, onChange }: any) => {
    const options =
      entityType === 'customer'
        ? [{ id: '507f1f77bcf86cd799439011', label: 'Customer Test' }]
        : [{ id: '507f1f77bcf86cd799439012', label: 'Product Test' }]

    return (
      <select
        aria-label={`${entityType}-select`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    )
  },
}))

vi.mock('../components/shared/QuickCreateModal', () => ({
  default: () => null,
}))

const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      orders: ordersReducer,
    },
    preloadedState: {
      auth: {
        user: { id: '1', name: 'Sales User', email: 'sales@example.com', role: 'Sales' },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      orders: {
        salesOrders: [],
        purchaseOrders: [],
        grns: [],
        invoices: [],
        loading: false,
        error: null,
      },
    },
  })

describe('Sales Order Form', () => {
  test('Renders form fields', async () => {
    ;(axiosInstance.get as any).mockResolvedValue({ data: [] })

    render(
      <Provider store={makeStore()}>
        <SalesOrders />
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'New SO' }))

    expect(await screen.findByText('Create Sales Order')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  test('Submits valid form', async () => {
    ;(axiosInstance.get as any).mockResolvedValue({ data: [] })
    ;(axiosInstance.post as any).mockResolvedValue({ data: { _id: 'order-1', status: 'Pending' } })

    render(
      <Provider store={makeStore()}>
        <SalesOrders />
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'New SO' }))

    fireEvent.change(screen.getByLabelText('customer-select'), {
      target: { value: '507f1f77bcf86cd799439011' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }))

    const productSelects = screen.getAllByLabelText('product-select')
    fireEvent.change(productSelects[0], {
      target: { value: '507f1f77bcf86cd799439012' },
    })

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await waitFor(() => expect(saveButton).toBeEnabled())
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/sales-orders',
        expect.objectContaining({
          customerId: '507f1f77bcf86cd799439011',
          items: [
            expect.objectContaining({
              productId: '507f1f77bcf86cd799439012',
              quantity: 1,
            }),
          ],
        })
      )
    })
  })
})
