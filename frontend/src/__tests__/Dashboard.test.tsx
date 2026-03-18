import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Dashboard from '../pages/Dashboard'
import { renderWithProviders } from '../test-utils'
import axiosInstance from '../services/axiosInstance'

jest.mock('../services/axiosInstance')

describe('Dashboard page', () => {
  it('renders metrics and exports CSV', async () => {
    ;(axiosInstance.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/dashboard/metrics')) {
        return Promise.resolve({ data: { totalSales: 100, pendingOrders: 2, lowStockAlerts: 1, activeCustomers: 3 } })
      }
      if (url.includes('/dashboard/chart')) {
        return Promise.resolve({ data: [{ month: 'Jan', revenue: 100 }] })
      }
      if (url.includes('/reports/sales')) {
        return Promise.resolve({ data: 'csv', headers: { 'content-type': 'text/csv' } })
      }
      return Promise.resolve({ data: [] })
    })

    renderWithProviders(<Dashboard />)

    await waitFor(() => expect(screen.getByText(/total sales/i)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /export sales csv/i }))
    expect(axiosInstance.get).toHaveBeenCalledWith('/reports/sales?format=csv', { responseType: 'blob' })
  })
})
