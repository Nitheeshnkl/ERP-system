import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Auth from '../pages/Auth'
import authReducer from '../features/auth/authSlice'
import axiosInstance from '../services/axiosInstance'
import { vi } from 'vitest'

vi.mock('../services/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
    },
  })

describe('Login page', () => {
  test('Renders correctly', () => {
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Auth />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText('ERP System')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Sign Up' })).toBeInTheDocument()
  })

  test('Submits form', async () => {
    ;(axiosInstance.post as any).mockResolvedValue({
      data: {
        token: 'token-123',
        user: { id: '1', name: 'User', email: 'user@example.com', role: 'Sales' },
      },
    })

    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Auth />
        </MemoryRouter>
      </Provider>
    )

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'password123',
      })
    })
  })

  test('Shows error on invalid login', async () => {
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <Auth />
        </MemoryRouter>
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Email and password are required')).toBeInTheDocument()
  })
})
