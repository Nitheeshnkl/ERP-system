import React, { PropsWithChildren } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import authReducer from './features/auth/authSlice'
import productsReducer from './features/products/productsSlice'
import ordersReducer from './features/orders/ordersSlice'
import dashboardReducer from './features/dashboard/dashboardSlice'
import customersReducer from './features/customers/customersSlice'
import suppliersReducer from './features/suppliers/suppliersSlice'

export const makeStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      products: productsReducer,
      orders: ordersReducer,
      dashboard: dashboardReducer,
      customers: customersReducer,
      suppliers: suppliersReducer,
    },
    preloadedState,
  })
}

export function renderWithProviders(ui: React.ReactElement, { preloadedState, route = '/' } = {}) {
  const store = makeStore(preloadedState)

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  )

  return { store, ...render(ui, { wrapper: Wrapper }) }
}
