import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { cachedGet, invalidateCacheByPrefix } from '../../services/cachedApi'
import axiosInstance from '../../services/axiosInstance'

type Supplier = {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
}

type Meta = { total: number; page: number; pageSize: number; totalPages: number }

interface SuppliersState {
  items: Supplier[]
  loading: boolean
  error: string | null
  meta: Meta
}

const initialState: SuppliersState = {
  items: [],
  loading: false,
  error: null,
  meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
}

const normalize = (s: any): Supplier => ({
  id: s._id || s.id,
  name: s.name || '',
  email: s.email || '',
  phone: s.phone || '',
  address: s.address || '',
})

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetch',
  async (params: { page?: number; limit?: number; search?: string }) => {
    const res: any = await cachedGet('/suppliers', params)
    return {
      items: (res.data || []).map(normalize),
      meta: res.meta || initialState.meta,
    }
  }
)

export const createSupplier = createAsyncThunk('suppliers/create', async (payload: Partial<Supplier>) => {
  const res: any = await axiosInstance.post('/suppliers', payload)
  invalidateCacheByPrefix('/suppliers::')
  return normalize(res.data)
})

export const updateSupplier = createAsyncThunk('suppliers/update', async ({ id, payload }: { id: string; payload: Partial<Supplier> }) => {
  const res: any = await axiosInstance.put(`/suppliers/${id}`, payload)
  invalidateCacheByPrefix('/suppliers::')
  return normalize(res.data)
})

export const deleteSupplier = createAsyncThunk('suppliers/delete', async (id: string) => {
  await axiosInstance.delete(`/suppliers/${id}`)
  invalidateCacheByPrefix('/suppliers::')
  return id
})

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.meta = action.payload.meta
      })
      .addCase(fetchSuppliers.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.error?.message || 'Failed to fetch suppliers'
      })
      .addCase(createSupplier.rejected, (state, action: any) => {
        state.error = action.error?.message || 'Create failed'
      })
      .addCase(updateSupplier.rejected, (state, action: any) => {
        state.error = action.error?.message || 'Update failed'
      })
      .addCase(deleteSupplier.rejected, (state, action: any) => {
        state.error = action.error?.message || 'Delete failed'
      })
  },
})

export default suppliersSlice.reducer
