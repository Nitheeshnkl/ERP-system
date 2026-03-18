import React from 'react'
import { render } from '@testing-library/react'
import { TableRowSkeleton, KPICardSkeleton, DashboardSkeleton, DataTableSkeleton } from '../components/LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('renders table row skeletons', () => {
    const { container } = render(<TableRowSkeleton />)
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
  })

  it('renders KPI and dashboard skeletons', () => {
    const { container } = render(<DashboardSkeleton />)
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(5)
  })

  it('renders data table skeleton', () => {
    const { container } = render(<DataTableSkeleton />)
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(5)
  })

  it('renders KPI card skeleton', () => {
    const { container } = render(<KPICardSkeleton />)
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
  })
})
