import React from 'react'
import { fireEvent, screen, within } from '@testing-library/react'
import VerifyEmail from '../pages/VerifyEmail'
import { renderWithProviders } from '../test-utils'
import axiosInstance from '../services/axiosInstance'

jest.mock('../services/axiosInstance')

let locationState: any = null

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ state: locationState }),
  }
})

describe('VerifyEmail page', () => {
  it('shows validation errors', () => {
    locationState = null
    renderWithProviders(<VerifyEmail />)

    fireEvent.click(screen.getByRole('button', { name: /verify/i }))
    expect(screen.getByText(/email and otp are required/i)).toBeInTheDocument()
  })

  it('resends OTP', async () => {
    ;(axiosInstance.post as jest.Mock).mockResolvedValue({ message: 'OTP resent' })
    locationState = { showVerifyModal: true, email: 'a@b.com' }
    renderWithProviders(<VerifyEmail />)

    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.click(screen.getByRole('button', { name: /resend otp/i }))
    expect(axiosInstance.post).toHaveBeenCalled()
  })
})
