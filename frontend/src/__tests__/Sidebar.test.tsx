import React from 'react'
import { screen } from '@testing-library/react'
import Sidebar from '../components/Sidebar'
import { renderWithProviders } from '../test-utils'

describe('Sidebar', () => {
  it('shows role-allowed menu items', () => {
    renderWithProviders(<Sidebar mobileOpen={false} onMobileClose={() => {}} />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { id: '1', name: 'Sales', email: 's@x.com', role: 'Sales' }, loading: false, initialized: true, error: null },
      },
    })

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Customers')).toBeInTheDocument()
    expect(screen.queryByText('Suppliers')).toBeNull()
  })
})
