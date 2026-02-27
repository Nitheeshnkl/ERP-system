import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Product } from '../../types/entities'
import axiosInstance from '../../services/axiosInstance'

interface ProductsState {
  items: Product[]
  loading: boolean
  error: string | null
  filters: {
    search: string
    lowStockOnly: boolean
  }
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    lowStockOnly: false,
  },
}

const normalizeProduct = (apiProduct: any, fallback?: Partial<Product>): Product => ({
  ...apiProduct,
  id: apiProduct._id || apiProduct.id || fallback?.id || '',
  name: apiProduct.name ?? fallback?.name ?? '',
  sku: apiProduct.sku ?? fallback?.sku ?? '',
  price: apiProduct.price ?? fallback?.price ?? 0,
  stock: apiProduct.stockQuantity ?? apiProduct.stock ?? fallback?.stock ?? 0,
  description: apiProduct.description ?? fallback?.description ?? '',
  unit: apiProduct.unit ?? fallback?.unit ?? '',
  reorderLevel: apiProduct.reorderLevel ?? fallback?.reorderLevel ?? 0,
})

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  try {
    const response = await axiosInstance.get('/products')
    // Transform _id to id for MUI DataGrid compatibility
    // Map backend fields (stockQuantity) to frontend fields (stock)
    return response.data.map((product: any) => normalizeProduct(product))
  } catch (error: any) {
    // Fallback to mock data
    return [
      {
        id: '1',
        name: 'Laptop Computer',
        sku: 'LP-001',
        description: 'Professional laptop for enterprise use',
        price: 1200,
        stock: 15,
        reorderLevel: 20,
        unit: 'pcs',
      },
      {
        id: '2',
        name: 'Office Chair',
        sku: 'OC-002',
        description: 'Ergonomic office chair',
        price: 450,
        stock: 45,
        reorderLevel: 30,
        unit: 'pcs',
      },
      {
        id: '3',
        name: 'Printer Paper',
        sku: 'PP-003',
        description: 'A4 white printer paper (500 sheets)',
        price: 8,
        stock: 18,
        reorderLevel: 50,
        unit: 'reams',
      },
      {
        id: '4',
        name: 'Monitor 27 inch',
        sku: 'MN-004',
        description: 'LED Monitor 27 inch Full HD',
        price: 350,
        stock: 22,
        reorderLevel: 25,
        unit: 'pcs',
      },
      {
        id: '5',
        name: 'Keyboard Mechanical',
        sku: 'KB-005',
        description: 'RGB Mechanical Keyboard',
        price: 150,
        stock: 35,
        reorderLevel: 20,
        unit: 'pcs',
      },
    ]
  }
})

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product: Omit<Product, 'id'>, { rejectWithValue }) => {
    try {
      // Map frontend fields to backend fields (backend uses stockQuantity, not stock)
      const backendPayload = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        stockQuantity: product.stock,
        unit: product.unit,
        reorderLevel: product.reorderLevel,
      }
      const response = await axiosInstance.post('/products', backendPayload)
      // Some API variants omit non-schema fields in create response; preserve form values.
      return normalizeProduct(response.data, product)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product')
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, ...product }: Product, { rejectWithValue }) => {
    try {
      // Map frontend fields to backend fields (backend uses stockQuantity, not stock)
      const backendPayload = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        stockQuantity: product.stock,
        unit: product.unit,
        reorderLevel: product.reorderLevel,
      }
      const response = await axiosInstance.put(`/products/${id}`, backendPayload)
      return normalizeProduct(response.data, { id, ...product })
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product')
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product')
    }
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchFilter(state, action) {
      state.filters.search = action.payload
    },
    setLowStockFilter(state, action) {
      state.filters.lowStockOnly = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })

    // createProduct
    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // updateProduct
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // deleteProduct
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { setSearchFilter, setLowStockFilter, clearError } = productsSlice.actions
export default productsSlice.reducer
