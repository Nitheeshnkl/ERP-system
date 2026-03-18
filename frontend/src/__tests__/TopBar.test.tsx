import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import TopBar from '../components/TopBar'
import { renderWithProviders } from '../test-utils'
import axiosInstance from '../services/axiosInstance'

const navigateMock = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

jest.mock('../services/axiosInstance')

describe('TopBar', () => {
  it('renders user info and logs out', () => {
    renderWithProviders(<TopBar onMenuOpen={jest.fn()} />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: '1', name: 'Jane Doe', email: 'jane@x.com', role: 'Admin' },
          loading: false,
          initialized: true,
          error: null,
        },
      },
    })

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText(/admin/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /jd/i }))
    fireEvent.click(screen.getByRole('menuitem', { name: /logout/i }))

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout')
    expect(navigateMock).toHaveBeenCalledWith('/login')
  })
})
