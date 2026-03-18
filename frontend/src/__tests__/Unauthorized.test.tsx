import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import Unauthorized from '../pages/Unauthorized'
import { renderWithProviders } from '../test-utils'

const navigateMock = jest.fn()

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Unauthorized page', () => {
  it('navigates back to dashboard', () => {
    renderWithProviders(<Unauthorized />)

    fireEvent.click(screen.getByRole('button', { name: /go to dashboard/i }))
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
