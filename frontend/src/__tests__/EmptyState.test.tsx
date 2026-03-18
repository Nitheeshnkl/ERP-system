import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import EmptyState from '../components/EmptyState'

describe('EmptyState', () => {
  it('renders title, description, and action button', () => {
    const onAction = jest.fn()
    render(
      <EmptyState
        title="No Data"
        description="Nothing here yet"
        actionLabel="Create"
        onAction={onAction}
      />
    )

    expect(screen.getByText(/no data/i)).toBeInTheDocument()
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(onAction).toHaveBeenCalled()
  })
})
