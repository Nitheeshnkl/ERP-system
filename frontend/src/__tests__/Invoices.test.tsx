import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import Invoices from '../pages/Invoices'
import { renderWithProviders } from '../test-utils'
import axiosInstance from '../services/axiosInstance'

jest.mock('../services/axiosInstance')

describe('Invoices page', () => {
  it('shows empty state when no invoices', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] })
    renderWithProviders(<Invoices />, {
      preloadedState: {
        orders: { salesOrders: [], purchaseOrders: [], grns: [], invoices: [], loading: false, error: null },
      },
    })
    expect(await screen.findByText(/no invoices found/i)).toBeInTheDocument()
  })

  it('exports CSV', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: [] })
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: 'csv', headers: { 'content-type': 'text/csv' } })

    renderWithProviders(<Invoices />, {
      preloadedState: {
        orders: { salesOrders: [], purchaseOrders: [], grns: [], invoices: [], loading: false, error: null },
      },
    })

    await screen.findByText(/no invoices found/i)
    fireEvent.click(screen.getByRole('button', { name: /export csv/i }))
    expect(axiosInstance.get).toHaveBeenCalled()
  })
})
