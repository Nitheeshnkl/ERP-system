import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from './app/store'
import { checkAuth, forceLogout } from './features/auth/authSlice'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { initSocketClient } from './services/socketClient'

const Auth = lazy(() => import('./pages/Auth'))
const Unauthorized = lazy(() => import('./pages/Unauthorized'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Customers = lazy(() => import('./pages/Customers'))
const Suppliers = lazy(() => import('./pages/Suppliers'))
const Products = lazy(() => import('./pages/Products'))
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'))
const GRN = lazy(() => import('./pages/GRN'))
const SalesOrders = lazy(() => import('./pages/SalesOrders'))
const Invoices = lazy(() => import('./pages/Invoices'))

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
    initSocketClient().catch(() => {})

    const onUnauthorized = () => {
      dispatch(forceLogout())
      navigate('/login', { replace: true })
    }

    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', onUnauthorized)
    }
  }, [dispatch, navigate])

  if (loading) {
    return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>Loading...</div>
  }

  return (
    <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>Loading page...</div>}>
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Purchase']}>
                <Suppliers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-orders"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
                <SalesOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Purchase']}>
                <PurchaseOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grn"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Purchase', 'Inventory']}>
                <GRN />
              </ProtectedRoute>
            }
          />
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
    </Suspense>
  )
}

export default App
