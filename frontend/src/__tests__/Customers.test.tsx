import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import Customers from '../pages/Customers'
import { renderWithProviders } from '../test-utils'
import axiosInstance from '../services/axiosInstance'

jest.mock('../services/axiosInstance')

jest.mock('../components/shared/DataTable', () => (props: any) => (
  <div>
    {props.rows.map((row: any) => (
      <div key={row.id}>
        {props.columns.map((col: any) => (
          <div key={col.field}>
            {col.renderCell ? col.renderCell({ row }) : row[col.field]}
          </div>
        ))}
      </div>
    ))}
  </div>
))

describe('Customers page', () => {
  const baseState = {
    customers: { items: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 }, loading: false, error: null },
  }

  beforeEach(() => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: [], meta: baseState.customers.meta })
    ;(axiosInstance.post as jest.Mock).mockResolvedValue({ data: { _id: '1', name: 'New', email: 'n@x.com' } })
    ;(axiosInstance.delete as jest.Mock).mockResolvedValue({})
  })

  it('shows Add Customer for Sales role', () => {
    renderWithProviders(<Customers />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Sales', email: 's@x.com', role: 'Sales' }, loading: false, initialized: true, error: null },
      },
    })
    expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument()
  })

  it('hides Add Customer for Inventory role', () => {
    renderWithProviders(<Customers />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Inv', email: 'i@x.com', role: 'Inventory' }, loading: false, initialized: true, error: null },
      },
    })
    expect(screen.queryByRole('button', { name: /add customer/i })).toBeNull()
  })

  it('creates a customer from the modal', async () => {
    renderWithProviders(<Customers />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Sales', email: 's@x.com', role: 'Sales' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /add customer/i }))
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'acme@x.com' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText(/customer created/i)).toBeInTheDocument()
    expect(axiosInstance.post).toHaveBeenCalled()
  })

  it('opens delete confirmation and deletes', async () => {
    renderWithProviders(<Customers />, {
      preloadedState: {
        ...baseState,
        customers: { ...baseState.customers, items: [{ id: 'c1', name: 'Old', email: 'o@x.com' }] },
        auth: { isAuthenticated: true, user: { id: '1', name: 'Admin', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByTestId('DeleteIcon'))
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(axiosInstance.delete).toHaveBeenCalled()
  })
})
