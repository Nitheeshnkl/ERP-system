import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from './app/store'
import { checkAuth } from './features/auth/authSlice'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import Unauthorized from './pages/Unauthorized'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Products from './pages/Products'
import PurchaseOrders from './pages/PurchaseOrders'
import GRN from './pages/GRN'
import SalesOrders from './pages/SalesOrders'
import Invoices from './pages/Invoices'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - accessible to all authenticated users */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Products - View: all roles, Create/Edit: admin+inventory, Delete: admin */}
        <Route path="/products" element={<Products />} />

        {/* Customers - View/Create/Edit: admin+sales, Delete: admin */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
              <Customers />
            </ProtectedRoute>
          }
        />

        {/* Suppliers - View/Create/Edit: admin+purchase, Delete: admin */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Purchase']}>
              <Suppliers />
            </ProtectedRoute>
          }
        />

        {/* Sales Orders - View/Create/Edit: admin+sales, Delete: admin */}
        <Route
          path="/sales-orders"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
              <SalesOrders />
            </ProtectedRoute>
          }
        />

        {/* Purchase Orders - View/Create/Edit: admin+purchase, Delete: admin */}
        <Route
          path="/purchase-orders"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Purchase']}>
              <PurchaseOrders />
            </ProtectedRoute>
          }
        />

        {/* GRN - View/Create: admin+purchase+inventory, Edit: admin+inventory, Delete: admin */}
        <Route
          path="/grn"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Purchase', 'Inventory']}>
              <GRN />
            </ProtectedRoute>
          }
        />

        {/* Invoices - View: admin+sales, Delete: admin */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
              <Invoices />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
