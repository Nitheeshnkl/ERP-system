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
import { Visibility as VisibilityIcon, Download as DownloadIcon } from '@mui/icons-material'
import { RootState, AppDispatch } from '../app/store'
import { fetchGRNs, clearError } from '../features/orders/ordersSlice'

export default function GRN() {
  const dispatch = useDispatch<AppDispatch>()
  const { grns, loading, error } = useSelector((state: RootState) => state.orders)

  useEffect(() => {
    dispatch(fetchGRNs())
  }, [dispatch])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success'
      case 'pending':
        return 'warning'
      case 'rejected':
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
          Goods Receipt Notes (GRN)
        </Typography>
      </Box>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Track all goods received against purchase orders
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : grns.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="textSecondary">No GRN records found.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>GRN #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PO #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Received Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total Items</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grns.map((grn: any) => (
                <TableRow key={grn.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{grn.grnNumber}</TableCell>
                  <TableCell>{grn.poNumber}</TableCell>
                  <TableCell>{grn.receivedDate}</TableCell>
                  <TableCell>{grn.totalItems}</TableCell>
                  <TableCell>
                    <Chip label={grn.status} color={getStatusColor(grn.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" title="View Details">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" title="Download">
                      <DownloadIcon />
                    </IconButton>
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
