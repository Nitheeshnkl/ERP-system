import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import productsReducer from '../features/products/productsSlice'
import ordersReducer from '../features/orders/ordersSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import customersReducer from '../features/customers/customersSlice'
import suppliersReducer from '../features/suppliers/suppliersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    orders: ordersReducer,
    dashboard: dashboardReducer,
    customers: customersReducer,
    suppliers: suppliersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
