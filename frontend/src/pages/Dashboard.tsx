import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { RootState, AppDispatch } from '../app/store'
import {
  fetchDashboardMetrics,
  fetchChartData,
  clearError,
} from '../features/dashboard/dashboardSlice'
import axiosInstance from '../services/axiosInstance'

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}

function KPICard({ title, value, icon, color }: KPICardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              backgroundColor: `${color}20`,
              borderRadius: 1,
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { metrics, chartData, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  )

  useEffect(() => {
    dispatch(fetchDashboardMetrics())
    dispatch(fetchChartData())
  }, [dispatch])

  const handleExportSalesCsv = async () => {
    try {
      const response = await axiosInstance.get('/reports/sales?format=csv', { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'sales-report.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (_error) {
      // Keep page stable on export errors.
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportSalesCsv}>
          Export Sales CSV
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && metrics === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Total Sales"
                value={`$${metrics?.totalSales?.toLocaleString() || 0}`}
                icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
                color="#388e3c"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Pending Orders"
                value={metrics?.pendingOrders || 0}
                icon={<ShoppingCartIcon sx={{ fontSize: 32 }} />}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Low Stock Alerts"
                value={metrics?.lowStockAlerts || 0}
                icon={<WarningIcon sx={{ fontSize: 32 }} />}
                color="#d32f2f"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KPICard
                title="Active Customers"
                value={metrics?.activeCustomers || 0}
                icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                color="#f57c00"
              />
            </Grid>
          </Grid>

          {/* Chart */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Monthly Revenue
              </Typography>
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `$${(value as number).toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#1976d2" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="textSecondary">No chart data available.</Typography>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}
