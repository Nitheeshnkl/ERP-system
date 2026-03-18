import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ErrorBoundary from '../components/ErrorBoundary'

function Thrower() {
  throw new Error('Boom')
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/boom/i)).toBeInTheDocument()
  })

  it('allows reset action without crashing', () => {
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
