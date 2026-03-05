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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { useState } from 'react'
import { Visibility as VisibilityIcon, Download as DownloadIcon } from '@mui/icons-material'
import { RootState, AppDispatch } from '../app/store'
import { fetchGRNs, clearError } from '../features/orders/ordersSlice'
import axiosInstance from '../services/axiosInstance'

export default function GRN() {
  const dispatch = useDispatch<AppDispatch>()
  const { grns, loading, error } = useSelector((state: RootState) => state.orders)
  const [selectedGrn, setSelectedGrn] = useState<any>(null)
  const [openView, setOpenView] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchGRNs())
  }, [dispatch])

  const handleView = async (id: string) => {
    try {
      setActionError(null)
      const response = await axiosInstance.get(`/grn/${id}`)
      setSelectedGrn(response.data)
      setOpenView(true)
    } catch (requestError: any) {
      setActionError(requestError.response?.data?.message || 'Unable to load GRN details')
    }
  }

  const handleDownload = async (id: string) => {
    try {
      setActionError(null)
      const response = await axiosInstance.get(`/grn/${id}`)
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `grn-${id}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (requestError: any) {
      setActionError(requestError.response?.data?.message || 'Unable to download GRN file')
    }
  }

  const getStatusColor = (status: string) => {
    switch (String(status || '').toLowerCase()) {
      case 'received':
      case 'completed':
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
      {(error || actionError) && (
        <Alert severity="error" onClose={() => { dispatch(clearError()); setActionError(null) }} sx={{ mb: 3 }}>
          {error || actionError}
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
              {grns.map((grn: any) => {
                const id = grn?._id || grn?.id || '-'
                const poRef = grn?.purchaseOrderId
                const poNumber = poRef?._id ? String(poRef._id).slice(-6).toUpperCase() : '-'
                const receivedDate = grn?.createdAt ? String(grn.createdAt).split('T')[0] : '-'
                const totalItems = Array.isArray(grn?.items)
                  ? grn.items.reduce((sum: number, item: any) => sum + Number(item?.receivedQuantity || 0), 0)
                  : 0
                const status = poRef?.status || 'Received'

                return (
                <TableRow key={id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{`GRN-${String(id).slice(-6).toUpperCase()}`}</TableCell>
                  <TableCell>{`PO-${poNumber}`}</TableCell>
                  <TableCell>{receivedDate}</TableCell>
                  <TableCell>{totalItems}</TableCell>
                  <TableCell>
                    <Chip label={status} color={getStatusColor(status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" title="View Details" onClick={() => handleView(id)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" title="Download" onClick={() => handleDownload(id)}>
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>GRN Details</DialogTitle>
        <DialogContent dividers>
          {selectedGrn ? (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(selectedGrn, null, 2)}</pre>
          ) : (
            <Typography color="textSecondary">No details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
