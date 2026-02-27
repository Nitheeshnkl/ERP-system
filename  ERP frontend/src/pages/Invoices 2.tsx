import { useEffect } from 'react'
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
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material'
import { RootState, AppDispatch } from '../app/store'
import { fetchInvoices, clearError } from '../features/orders/ordersSlice'

export default function Invoices() {
  const dispatch = useDispatch<AppDispatch>()
  const { invoices, loading, error } = useSelector((state: RootState) => state.orders)

  useEffect(() => {
    dispatch(fetchInvoices())
  }, [dispatch])

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'overdue':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Invoices
        </Typography>
      </Box>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Manage customer invoices and payment tracking
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
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
              {invoices.map((invoice: any) => (
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
                    <IconButton size="small" title="View">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" title="Download PDF">
                      <DownloadIcon />
                    </IconButton>
                    {invoice.paymentStatus !== 'paid' && (
                      <IconButton size="small" title="Mark as Paid">
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
