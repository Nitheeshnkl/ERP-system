import React from 'react'
import { screen } from '@testing-library/react'
import { useAuth } from '../hooks/useAuth'
import { renderWithProviders } from '../test-utils'

function AuthProbe() {
  const auth = useAuth()
  return <div>{auth.user?.name || 'NoUser'}</div>
}

describe('useAuth hook', () => {
  it('returns auth state', () => {
    renderWithProviders(<AuthProbe />, {
      preloadedState: {
        auth: { isAuthenticated: true, user: { id: '1', name: 'Tester', email: 't@x.com', role: 'Admin' }, loading: false, initialized: true, error: null },
      },
    })

    expect(screen.getByText('Tester')).toBeInTheDocument()
  })
})
