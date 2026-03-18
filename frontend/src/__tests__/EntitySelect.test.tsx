import React from 'react'
import { render, waitFor } from '@testing-library/react'
import EntitySelect from '../components/shared/EntitySelect'
import axiosInstance from '../services/axiosInstance'

jest.mock('../services/axiosInstance')

describe('EntitySelect', () => {
  it('fetches options from API', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: [{ _id: '1', name: 'Cust' }] })

    render(
      <EntitySelect
        entityType="customer"
        value=""
        onChange={() => {}}
        required
      />
    )

    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled())
  })
})
