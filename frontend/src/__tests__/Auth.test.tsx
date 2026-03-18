import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import Auth from '../pages/Auth'
import { renderWithProviders } from '../test-utils'

jest.mock('../services/axiosInstance')

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ state: null }),
  }
})

describe('Auth page', () => {
  it('shows validation for empty sign in', () => {
    renderWithProviders(<Auth />)

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText(/email and password are required/i)).toBeInTheDocument()
  })

  it('shows validation for empty sign up', () => {
    renderWithProviders(<Auth />)

    fireEvent.click(screen.getByRole('tab', { name: /sign up/i }))
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    expect(screen.getByText(/name, email, and password are required/i)).toBeInTheDocument()
  })
})
