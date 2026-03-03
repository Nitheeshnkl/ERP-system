import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../components/ProtectedRoute'

describe('Protected Route', () => {
  test('Redirects when not authenticated', () => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        }),
      },
    })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Private Dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
