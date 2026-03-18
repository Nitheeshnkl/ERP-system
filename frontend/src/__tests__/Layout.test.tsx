import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import Layout from '../components/Layout'
import { renderWithProviders } from '../test-utils'

const sidebarMock = jest.fn(({ mobileOpen, onMobileClose }: any) => (
  <div data-testid="sidebar" data-open={mobileOpen} onClick={onMobileClose} />
))

const topbarMock = jest.fn(({ onMenuOpen }: any) => (
  <button type="button" onClick={onMenuOpen}>Open Menu</button>
))

jest.mock('../components/Sidebar', () => ({
  __esModule: true,
  default: (props: any) => sidebarMock(props),
  DRAWER_WIDTH: 260,
}))

jest.mock('../components/TopBar', () => ({
  __esModule: true,
  default: (props: any) => topbarMock(props),
}))

describe('Layout', () => {
  it('toggles mobile drawer state', () => {
    renderWithProviders(<Layout />)

    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'false')
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'true')

    fireEvent.click(screen.getByTestId('sidebar'))
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'false')
  })
})
