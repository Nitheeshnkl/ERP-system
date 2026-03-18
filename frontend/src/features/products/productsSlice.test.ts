/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer, {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setSearchFilter,
  setLowStockFilter,
  clearError,
} from './productsSlice'
import axiosInstance from '../../services/axiosInstance'

jest.mock('../../services/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('productsSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates filters and clears error', () => {
    let state = reducer(undefined, setSearchFilter('abc'))
    expect(state.filters.search).toBe('abc')

    state = reducer(state, setLowStockFilter(true))
    expect(state.filters.lowStockOnly).toBe(true)

    state = reducer({ ...state, error: 'err' }, clearError())
    expect(state.error).toBeNull()
  })

  it('fetchProducts transforms items', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({
      data: [{ _id: '1', name: 'P', sku: 'S', stockQuantity: 2 }],
    })

    const dispatch = jest.fn()
    const getState = jest.fn()

    const result: any = await fetchProducts()(dispatch, getState, undefined)
    expect(result.type).toBe('products/fetchProducts/fulfilled')
    expect(result.payload[0]).toEqual(expect.objectContaining({ id: '1', stock: 2 }))
  })

  it('create/update/delete reducers mutate items', () => {
    const created = reducer(
      { items: [], loading: false, error: null, filters: { search: '', lowStockOnly: false } },
      createProduct.fulfilled({ id: '1', name: 'P' } as any, '', undefined as any)
    )
    expect(created.items).toHaveLength(1)

    const updated = reducer(
      created as any,
      updateProduct.fulfilled({ id: '1', name: 'P2' } as any, '', undefined as any)
    )
    expect(updated.items[0].name).toBe('P2')

    const deleted = reducer(
      updated as any,
      deleteProduct.fulfilled('1', '', undefined as any)
    )
    expect(deleted.items).toHaveLength(0)
  })
})
