import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { SalesOrder, PurchaseOrder, GRN, Invoice } from '../../types/entities'
import axiosInstance from '../../services/axiosInstance'

interface OrdersState {
  salesOrders: SalesOrder[]
  purchaseOrders: PurchaseOrder[]
  grns: GRN[]
  invoices: Invoice[]
  loading: boolean
  error: string | null
}

const initialState: OrdersState = {
  salesOrders: [],
  purchaseOrders: [],
  grns: [],
  invoices: [],
  loading: false,
  error: null,
}

const unwrapApiData = (payload: any) => (payload && payload.data !== undefined ? payload.data : payload)

// Sales Orders
export const fetchSalesOrders = createAsyncThunk(
  'orders/fetchSalesOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/sales-orders')
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales orders')
    }
  }
)

export const createSalesOrder = createAsyncThunk(
  'orders/createSalesOrder',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/sales-orders', payload)
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Create sales order failed')
    }
  }
)

export const updateSalesOrder = createAsyncThunk(
  'orders/updateSalesOrder',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/sales-orders/${id}`, data)
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Update sales order failed')
    }
  }
)

export const deleteSalesOrder = createAsyncThunk(
  'orders/deleteSalesOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/sales-orders/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Delete sales order failed')
    }
  }
)

// Purchase Orders
export const fetchPurchaseOrders = createAsyncThunk(
  'orders/fetchPurchaseOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/purchase-orders')
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase orders')
    }
  }
)

export const createPurchaseOrder = createAsyncThunk(
  'orders/createPurchaseOrder',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/purchase-orders', payload)
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Create purchase order failed')
    }
  }
)

export const updatePurchaseOrder = createAsyncThunk(
  'orders/updatePurchaseOrder',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/purchase-orders/${id}`, data)
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Update purchase order failed')
    }
  }
)

export const deletePurchaseOrder = createAsyncThunk(
  'orders/deletePurchaseOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/purchase-orders/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Delete purchase order failed')
    }
  }
)

// GRNs
export const fetchGRNs = createAsyncThunk(
  'orders/fetchGRNs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/grn')
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch GRNs')
    }
  }
)

// Invoices
export const fetchInvoices = createAsyncThunk(
  'orders/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/invoices')
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices')
    }
  }
)

export const updateInvoiceStatus = createAsyncThunk(
  'orders/updateInvoiceStatus',
  async ({ id, status }: { id: string; status: 'Paid' | 'Pending' | 'Cancelled' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/invoices/${id}/status`, { status })
      return unwrapApiData(response.data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice status')
    }
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSalesOrders
      .addCase(fetchSalesOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSalesOrders.fulfilled, (state, action) => {
        state.salesOrders = Array.isArray(action.payload) ? action.payload : []
        state.loading = false
      })
      .addCase(fetchSalesOrders.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch sales orders'
        state.loading = false
      })
      // createSalesOrder
      .addCase(createSalesOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSalesOrder.fulfilled, (state, action) => {
        state.salesOrders = [action.payload, ...state.salesOrders]
        state.loading = false
      })
      .addCase(createSalesOrder.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      // updateSalesOrder
      .addCase(updateSalesOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSalesOrder.fulfilled, (state, action) => {
        state.salesOrders = state.salesOrders.map((s: any) =>
          (s._id === action.payload._id || s.id === action.payload._id) ? action.payload : s
        )
        state.loading = false
      })
      .addCase(updateSalesOrder.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      // deleteSalesOrder
      .addCase(deleteSalesOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSalesOrder.fulfilled, (state, action) => {
        state.salesOrders = state.salesOrders.filter(
          (s: any) => s._id !== action.payload && s.id !== action.payload
        )
        state.loading = false
      })
      .addCase(deleteSalesOrder.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      // fetchPurchaseOrders
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.purchaseOrders = Array.isArray(action.payload) ? action.payload : []
        state.loading = false
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch purchase orders'
        state.loading = false
      })
      // createPurchaseOrder
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders = [action.payload, ...state.purchaseOrders]
        state.loading = false
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      // updatePurchaseOrder
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders = state.purchaseOrders.map((p: any) =>
          (p._id === action.payload._id || p.id === action.payload._id) ? action.payload : p
        )
        state.loading = false
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      // deletePurchaseOrder
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders = state.purchaseOrders.filter(
          (p: any) => p._id !== action.payload && p.id !== action.payload
        )
        state.loading = false
      })
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      // fetchGRNs
      .addCase(fetchGRNs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGRNs.fulfilled, (state, action) => {
        state.grns = Array.isArray(action.payload) ? action.payload : []
        state.loading = false
      })
      .addCase(fetchGRNs.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch GRNs'
        state.loading = false
      })
      // fetchInvoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = Array.isArray(action.payload) ? action.payload : []
        state.loading = false
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch invoices'
        state.loading = false
      })
      // updateInvoiceStatus
      .addCase(updateInvoiceStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
        state.invoices = state.invoices.map((invoice: any) =>
          (invoice._id === action.payload._id || invoice.id === action.payload._id)
            ? action.payload
            : invoice
        )
        state.loading = false
      })
      .addCase(updateInvoiceStatus.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update invoice status'
        state.loading = false
      })
  },
})

export const { clearError } = ordersSlice.actions
export default ordersSlice.reducer
