import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import Suppliers from '../pages/Suppliers'
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

describe('Suppliers page', () => {
  const baseState = {
    suppliers: { items: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 }, loading: false, error: null },
  }

  beforeEach(() => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: [], meta: baseState.suppliers.meta })
    ;(axiosInstance.post as jest.Mock).mockResolvedValue({ data: { _id: '1', name: 'New', email: 'n@x.com' } })
    ;(axiosInstance.delete as jest.Mock).mockResolvedValue({})
  })

  it('shows Add Supplier for Purchase role', () => {
    renderWithProviders(<Suppliers />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Purchase', email: 'p@x.com', role: 'Purchase' }, loading: false, initialized: true, error: null },
      },
    })
    expect(screen.getByRole('button', { name: /add supplier/i })).toBeInTheDocument()
  })

  it('creates a supplier from the modal', async () => {
    renderWithProviders(<Suppliers />, {
      preloadedState: {
        ...baseState,
        auth: { isAuthenticated: true, user: { id: '1', name: 'Admin', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /add supplier/i }))
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Supply Co' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'supply@x.com' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText(/supplier created/i)).toBeInTheDocument()
    expect(axiosInstance.post).toHaveBeenCalled()
  })

  it('deletes a supplier when confirmed', () => {
    renderWithProviders(<Suppliers />, {
      preloadedState: {
        ...baseState,
        suppliers: { ...baseState.suppliers, items: [{ id: 's1', name: 'Old', email: 'o@x.com' }] },
        auth: { isAuthenticated: true, user: { id: '1', name: 'Admin', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    fireEvent.click(screen.getByTestId('DeleteIcon'))
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(axiosInstance.delete).toHaveBeenCalled()
  })
})
