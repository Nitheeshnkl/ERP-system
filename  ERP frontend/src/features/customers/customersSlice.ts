import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axiosInstance'

type Customer = {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}

type Meta = { total: number; page: number; pageSize: number; totalPages: number }

interface CustomersState {
  items: Customer[]
  loading: boolean
  error: string | null
  meta: Meta
}

const initialState: CustomersState = {
  items: [],
  loading: false,
  error: null,
  meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
}

const normalize = (c: any): Customer => ({
  id: c._id || c.id,
  name: c.name || '',
  email: c.email || '',
  phone: c.phone || '',
  address: c.address || '',
})

export const fetchCustomers = createAsyncThunk(
  'customers/fetch',
  async (params: { page?: number; limit?: number; search?: string }) => {
    const res: any = await axiosInstance.get('/customers', { params })
    return {
      items: (res.data || []).map(normalize),
      meta: res.meta || initialState.meta,
    }
  }
)

export const createCustomer = createAsyncThunk('customers/create', async (payload: Partial<Customer>) => {
  const res: any = await axiosInstance.post('/customers', payload)
  return normalize(res.data)
})

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, payload }: { id: string; payload: Partial<Customer> }) => {
  const res: any = await axiosInstance.put(`/customers/${id}`, payload)
  return normalize(res.data)
})

export const deleteCustomer = createAsyncThunk('customers/delete', async (id: string) => {
  await axiosInstance.delete(`/customers/${id}`)
  return id
})

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.meta = action.payload.meta
      })
      .addCase(fetchCustomers.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.error?.message || 'Failed to fetch customers'
      })
      .addCase(createCustomer.rejected, (state, action: any) => {
        state.error = action.error?.message || 'Create failed'
      })
      .addCase(updateCustomer.rejected, (state, action: any) => {
        state.error = action.error?.message || 'Update failed'
      })
      .addCase(deleteCustomer.rejected, (state, action: any) => {
        state.error = action.error?.message || 'Delete failed'
      })
  },
})

export default customersSlice.reducer
