/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer, { fetchSuppliers, createSupplier } from './suppliersSlice'
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

describe('suppliersSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetchSuppliers populates items', async () => {
    ;(cachedGet as jest.Mock).mockResolvedValue({
      data: [{ _id: '1', name: 'S', email: 's@b.com' }],
      meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
    })

    const dispatch = jest.fn()
    const getState = jest.fn()
    const result: any = await fetchSuppliers({ page: 1, limit: 10, search: '' })(dispatch, getState, undefined)

    expect(result.type).toBe('suppliers/fetch/fulfilled')
    expect(result.payload.items[0]).toEqual(
      expect.objectContaining({ id: '1', name: 'S', email: 's@b.com' })
    )
  })

  it('createSupplier invalidates cache', async () => {
    ;(axiosInstance.post as jest.Mock).mockResolvedValue({ data: { _id: '2', name: 'S2', email: 's2@b.com' } })

    const dispatch = jest.fn()
    const getState = jest.fn()
    const result: any = await createSupplier({ name: 'S2', email: 's2@b.com' })(dispatch, getState, undefined)

    expect(result.type).toBe('suppliers/create/fulfilled')
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith('/suppliers::')
  })

  it('fetchSuppliers rejected updates error', () => {
    const state = reducer(undefined as any, fetchSuppliers.rejected(new Error('fail'), '', { page: 1 }))
    expect(state.error).toBe('fail')
  })
})
