/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer, { fetchCustomers, createCustomer } from './customersSlice'
import { cachedGet, invalidateCacheByPrefix } from '../../services/cachedApi'
import axiosInstance from '../../services/axiosInstance'

jest.mock('../../services/cachedApi', () => ({
  cachedGet: jest.fn(),
  invalidateCacheByPrefix: jest.fn(),
}))

jest.mock('../../services/axiosInstance', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))

describe('customersSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetchCustomers populates items', async () => {
    ;(cachedGet as jest.Mock).mockResolvedValue({
      data: [{ _id: '1', name: 'A', email: 'a@b.com' }],
      meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
    })

    const dispatch = jest.fn()
    const getState = jest.fn()
    const result: any = await fetchCustomers({ page: 1, limit: 10, search: '' })(dispatch, getState, undefined)

    expect(result.type).toBe('customers/fetch/fulfilled')
    expect(result.payload.items[0]).toEqual(
      expect.objectContaining({ id: '1', name: 'A', email: 'a@b.com' })
    )
  })

  it('createCustomer invalidates cache', async () => {
    ;(axiosInstance.post as jest.Mock).mockResolvedValue({ data: { _id: '2', name: 'B', email: 'b@b.com' } })

    const dispatch = jest.fn()
    const getState = jest.fn()
    const result: any = await createCustomer({ name: 'B', email: 'b@b.com' })(dispatch, getState, undefined)

    expect(result.type).toBe('customers/create/fulfilled')
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith('/customers::')
  })

  it('fetchCustomers rejected updates error', () => {
    const state = reducer(undefined as any, fetchCustomers.rejected(new Error('fail'), '', { page: 1 }))
    expect(state.error).toBe('fail')
  })
})
