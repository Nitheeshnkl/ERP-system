import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import QuickCreateModal from '../components/shared/QuickCreateModal'

jest.mock('../services/axiosInstance')

describe('QuickCreateModal', () => {
  it('shows validation errors and duplicate flow', () => {
    const onCreated = jest.fn()
    const onClose = jest.fn()

    renderWithProvidersWrapper(
      <QuickCreateModal
        entityType="customer"
        open
        canCreate
        existingOptions={[{ id: '1', name: 'Acme', subtitle: '' }]}
        onClose={onClose}
        onCreated={onCreated}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByText(/similar record already exists/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /use existing/i }))
    expect(onCreated).toHaveBeenCalledWith({ id: '1', name: 'Acme', subtitle: '' })
  })
})

function renderWithProvidersWrapper(ui: React.ReactElement) {
  const { render } = require('@testing-library/react')
  return render(ui)
}
