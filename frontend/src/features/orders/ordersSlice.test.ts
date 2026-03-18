/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer, {
  fetchSalesOrders,
  fetchPurchaseOrders,
  fetchGRNs,
  fetchInvoices,
  updateInvoiceStatus,
  clearError,
} from './ordersSlice'
import axiosInstance from '../../services/axiosInstance'

jest.mock('../../services/axiosInstance', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

const initialState = {
  salesOrders: [],
  purchaseOrders: [],
  grns: [],
  invoices: [],
  loading: false,
  error: null,
}

describe('ordersSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('clears error', () => {
    const state = reducer({ ...initialState, error: 'oops' }, clearError())
    expect(state.error).toBeNull()
  })

  it('fetchSalesOrders fulfilled updates salesOrders', () => {
    const payload = [{ id: '1' }]
    const state = reducer(initialState as any, fetchSalesOrders.fulfilled(payload as any, '', undefined))
    expect(state.salesOrders).toEqual(payload)
    expect(state.loading).toBe(false)
  })

  it('fetchPurchaseOrders rejected sets error', () => {
    const state = reducer(initialState as any, fetchPurchaseOrders.rejected(new Error('fail'), '', undefined))
    expect(state.error).toBe('Failed to fetch purchase orders')
    expect(state.loading).toBe(false)
  })

  it('fetchGRNs thunk calls API', async () => {
    ;(axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] })
    const dispatch = jest.fn()
    const getState = jest.fn()

    const result: any = await fetchGRNs()(dispatch, getState, undefined)
    expect(result.type).toBe('orders/fetchGRNs/fulfilled')
    expect(axiosInstance.get).toHaveBeenCalledWith('/grn')
  })

  it('fetchInvoices handles errors', async () => {
    ;(axiosInstance.get as jest.Mock).mockRejectedValue({ response: { data: { message: 'bad' } } })
    const dispatch = jest.fn()
    const getState = jest.fn()

    const result: any = await fetchInvoices()(dispatch, getState, undefined)
    expect(result.type).toBe('orders/fetchInvoices/rejected')
  })

  it('updateInvoiceStatus uses patch', async () => {
    ;(axiosInstance.patch as jest.Mock).mockResolvedValue({ data: { id: 'inv1', status: 'Paid' } })
    const dispatch = jest.fn()
    const getState = jest.fn()

    const result: any = await updateInvoiceStatus({ id: 'inv1', status: 'Paid' })(dispatch, getState, undefined)
    expect(result.type).toBe('orders/updateInvoiceStatus/fulfilled')
    expect(axiosInstance.patch).toHaveBeenCalledWith('/invoices/inv1/status', { status: 'Paid' })
  })
})
