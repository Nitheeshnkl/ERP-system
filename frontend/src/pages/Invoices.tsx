import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Payment as PaymentIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material'
import { RootState, AppDispatch } from '../app/store'
import { fetchInvoices, clearError, updateInvoiceStatus } from '../features/orders/ordersSlice'
import axiosInstance from '../services/axiosInstance'

type InvoiceRow = {
  id: string
  invoiceNumber: string
  customerName: string
  amount: number
  issuedDate: string
  dueDate: string
  paymentStatus: 'Paid' | 'Pending' | 'Cancelled'
}

const formatDate = (value: any) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toISOString().split('T')[0]
}

const normalizeStatus = (value: any): 'Paid' | 'Pending' | 'Cancelled' => {
  const normalized = String(value || 'Pending').toLowerCase()
  if (normalized === 'paid') return 'Paid'
  if (normalized === 'cancelled') return 'Cancelled'
  return 'Pending'
}

export default function Invoices() {
  const dispatch = useDispatch<AppDispatch>()
  const { invoices, loading, error } = useSelector((state: RootState) => state.orders)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchInvoices())
  }, [dispatch])

  const invoiceRows: InvoiceRow[] = useMemo(() => {
    return (Array.isArray(invoices) ? invoices : []).map((invoice: any) => {
      const id = invoice?._id || invoice?.id || ''
      const salesOrder = invoice?.salesOrderId || {}
      const status = normalizeStatus(invoice?.paymentStatus || invoice?.status)
      return {
        id,
        invoiceNumber: invoice?.invoiceNumber || `INV-${String(id).slice(-6)}` || 'N/A',
        customerName: salesOrder?.customerName || invoice?.customerName || salesOrder?.customerId || 'N/A',
        amount: Number(invoice?.amount ?? invoice?.totalAmount ?? salesOrder?.totalAmount ?? 0),
        issuedDate: formatDate(invoice?.issuedDate || invoice?.createdAt),
        dueDate: formatDate(invoice?.dueDate),
        paymentStatus: status,
      }
    })
  }, [invoices])

  const getPaymentStatusColor = (status: InvoiceRow['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'Cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const downloadFile = async (endpoint: string, fileName: string, openInNewTab = false) => {
    setLocalError(null)
    try {
      const response = await axiosInstance.get(endpoint, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' })
      const blobUrl = window.URL.createObjectURL(blob)

      if (openInNewTab) {
        window.open(blobUrl, '_blank', 'noopener,noreferrer')
        window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000)
        return
      }

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Unable to download file')
    }
  }

  return (
    <Box>
      {(error || localError) && (
        <Alert severity="error" onClose={() => { dispatch(clearError()); setLocalError(null) }} sx={{ mb: 3 }}>
          {error || localError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Invoices
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={() => downloadFile('/reports/invoices?format=csv', 'invoices-report.csv')}
        >
          Export CSV
        </Button>
      </Box>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Manage customer invoices and payment tracking
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : invoiceRows.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="textSecondary">No invoices found.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Issued Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceRows.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{invoice.issuedDate}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.paymentStatus}
                      color={getPaymentStatusColor(invoice.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      title="View"
                      onClick={() => downloadFile(`/invoices/${invoice.id}/pdf`, `${invoice.invoiceNumber}.pdf`, true)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Download PDF"
                      onClick={() => downloadFile(`/invoices/${invoice.id}/pdf`, `${invoice.invoiceNumber}.pdf`)}
                    >
                      <DownloadIcon />
                    </IconButton>
                    {invoice.paymentStatus !== 'Paid' && (
                      <IconButton
                        size="small"
                        title="Mark as Paid"
                        onClick={() => dispatch(updateInvoiceStatus({ id: invoice.id, status: 'Paid' }))}
                      >
                        <PaymentIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
