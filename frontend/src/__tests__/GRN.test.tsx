import React from 'react'
import { screen } from '@testing-library/react'
import GRN from '../pages/GRN'
import { renderWithProviders } from '../test-utils'
import axiosInstance from '../services/axiosInstance'

jest.mock('../services/axiosInstance')

describe('GRN page', () => {
  it('shows empty state when no GRNs', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] })
    renderWithProviders(<GRN />, {
      preloadedState: {
        orders: { salesOrders: [], purchaseOrders: [], grns: [], invoices: [], loading: false, error: null },
        auth: { isAuthenticated: true, user: { id: '1', name: 'I', email: 'i@x.com', role: 'Inventory' }, loading: false, initialized: true, error: null },
      },
    })

    expect(await screen.findByText(/no grn records found/i)).toBeInTheDocument()
  })
})
