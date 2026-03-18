import React from 'react'
import { screen, act } from '@testing-library/react'
import App from '../App'
import { renderWithProviders } from '../test-utils'
import axiosInstance from '../services/axiosInstance'

jest.mock('../services/axiosInstance')

jest.mock('../pages/Auth', () => ({
  __esModule: true,
  default: () => <div>Auth Page</div>,
}))

jest.mock('../pages/Unauthorized', () => ({
  __esModule: true,
  default: () => <div>Unauthorized Page</div>,
}))

jest.mock('../pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Dashboard Page</div>,
}))

jest.mock('../pages/Customers', () => ({
  __esModule: true,
  default: () => <div>Customers Page</div>,
}))

jest.mock('../pages/VerifyEmail', () => ({
  __esModule: true,
  default: () => <div>Verify Email Page</div>,
}))

jest.mock('../pages/Products', () => ({
  __esModule: true,
  default: () => <div>Products Page</div>,
}))

jest.mock('../pages/Suppliers', () => ({
  __esModule: true,
  default: () => <div>Suppliers Page</div>,
}))

jest.mock('../pages/PurchaseOrders', () => ({
  __esModule: true,
  default: () => <div>Purchase Orders Page</div>,
}))

jest.mock('../pages/SalesOrders', () => ({
  __esModule: true,
  default: () => <div>Sales Orders Page</div>,
}))

jest.mock('../pages/GRN', () => ({
  __esModule: true,
  default: () => <div>GRN Page</div>,
}))

jest.mock('../pages/Invoices', () => ({
  __esModule: true,
  default: () => <div>Invoices Page</div>,
}))

jest.mock('../services/socketClient', () => ({
  initSocketClient: () => Promise.resolve(),
}))

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders login page route', async () => {
    renderWithProviders(<App />, {
      route: '/login',
      preloadedState: {
        auth: { isAuthenticated: false, user: null, loading: false, initialized: true, error: null },
      },
    })

    expect(await screen.findByText(/auth page/i)).toBeInTheDocument()
  })

  it('redirects to unauthorized for restricted route', async () => {
    renderWithProviders(<App />, {
      route: '/customers',
      preloadedState: {
        auth: { isAuthenticated: true, user: { id: '1', role: 'Inventory' }, loading: false, initialized: true, error: null },
      },
    })

    expect(await screen.findByText(/unauthorized page/i)).toBeInTheDocument()
  })

  it('handles auth:unauthorized event by navigating to login', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: { id: '1', name: 'User' } })
    localStorage.setItem('auth_token', 'token')

    renderWithProviders(<App />, {
      route: '/dashboard',
      preloadedState: {
        auth: { isAuthenticated: true, user: { id: '1', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    expect(await screen.findByText(/dashboard page/i)).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('auth:unauthorized'))
    })

    expect(await screen.findByText(/auth page/i)).toBeInTheDocument()
  })
})
