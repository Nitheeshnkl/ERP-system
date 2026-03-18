import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { screen } from '@testing-library/react'
import ProtectedRoute from '../components/ProtectedRoute'
import { renderWithProviders } from '../test-utils'

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Secret</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>,
      { preloadedState: { auth: { isAuthenticated: false, user: null, loading: false, initialized: true, error: null } } }
    )
    expect(screen.queryByText('Secret')).toBeNull()
  })

  it('blocks unauthorized roles', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <div>Secret</div>
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<div>Denied</div>} />
      </Routes>,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: '1', name: 'U', email: 'u@x.com', role: 'Sales' }, loading: false, initialized: true, error: null } } }
    )
    expect(screen.queryByText('Secret')).toBeNull()
  })

  it('renders children for allowed role', () => {
    renderWithProviders(
      <ProtectedRoute allowedRoles={['Admin']}>
        <div>Secret</div>
      </ProtectedRoute>,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: '1', name: 'A', email: 'a@x.com', role: 'Admin' }, loading: false, initialized: true, error: null } } }
    )
    expect(screen.getByText('Secret')).toBeInTheDocument()
  })
})
