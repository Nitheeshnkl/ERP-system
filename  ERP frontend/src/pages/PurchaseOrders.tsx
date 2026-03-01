import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { RootState, AppDispatch } from '../app/store'
import { hasAnyRole } from '../utils/roleUtils'
import { fetchPurchaseOrders, clearError, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../features/orders/ordersSlice'

export default function PurchaseOrders() {
  const dispatch = useDispatch<AppDispatch>()
  const { purchaseOrders: orders, loading, error } = useSelector(
    (state: RootState) => state.orders
  )
  const { user } = useSelector((state: RootState) => state.auth)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    orderNumber: '',
    supplierId: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    status: 'Pending',
    date: '',
  })

  // Permissions (case-insensitive)
  const canCreateEdit = hasAnyRole(user?.role, ['Admin', 'Purchase'])
  const canDelete = hasAnyRole(user?.role, ['Admin'])

  useEffect(() => {
    dispatch(fetchPurchaseOrders())
  }, [dispatch])

  const handleOpenDialog = (order?: any) => {
    setValidationError(null)
    if (order) {
      setEditingOrder(order)
      setFormData({
        orderNumber: order.orderNumber || order.poNumber || '',
        supplierId: order.supplierId?._id || order.supplierId || '',
        productId: order.items && order.items[0] ? (order.items[0].productId?._id || order.items[0].productId) : '',
        quantity: order.items && order.items[0] ? order.items[0].quantity : 1,
        unitPrice: order.items && order.items[0] ? order.items[0].unitPrice : order.totalAmount || 0,
        totalAmount: order.totalAmount || 0,
        status: order.status || 'Pending',
        date: order.createdAt ? order.createdAt.split('T')[0] : (order.date || ''),
      })
    } else {
      setEditingOrder(null)
      // Generate a new order number based on existing pattern (PO-XXX)
      const newOrderNumber = `PO-${String(Date.now()).slice(-6)}`
      setFormData({
        orderNumber: newOrderNumber,
        supplierId: '',
        productId: '',
        quantity: 1,
        unitPrice: 0,
        totalAmount: 0,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingOrder(null)
    setValidationError(null)
  }

  const handleSave = () => {
    if (!formData.supplierId || !formData.productId) {
      setValidationError('Supplier and Product are required')
      return
    }

    setValidationError(null)
    // Send the values with both ID and name fields to support free-text input
    const payload = {
      orderNumber: formData.orderNumber,
      supplierId: formData.supplierId,
      supplierName: formData.supplierId,  // Store the entered text
      items: [
        {
          productId: formData.productId,
          productName: formData.productId,  // Store the entered text
          quantity: Number(formData.quantity),
          unitPrice: Number(formData.unitPrice) || 0,
        },
      ],
      totalAmount: Number(formData.totalAmount) || (Number(formData.quantity) * Number(formData.unitPrice)),
      status: formData.status || 'Pending',
    }

    if (editingOrder) {
      dispatch(updatePurchaseOrder({ id: editingOrder._id || editingOrder.id, data: payload }))
    } else {
      dispatch(createPurchaseOrder(payload))
    }
    handleCloseDialog()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
        return 'success'
      case 'Processing':
        return 'info'
      case 'Pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {(error || validationError) && (
        <Alert severity="error" onClose={() => { dispatch(clearError()); setValidationError(null) }} sx={{ mb: 3 }}>
          {error || validationError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Purchase Orders
        </Typography>
        {canCreateEdit && (
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => handleOpenDialog()}>
            New PO
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="textSecondary">No purchase orders found.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order._id || order.id || order.orderNumber || order.poNumber} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber || order.poNumber || '-'}</TableCell>
                  <TableCell>{order.supplierName || order.supplierId?.name || '-'}</TableCell>
                  <TableCell>{Array.isArray(order.items) ? order.items.length : (order.items || 0)}</TableCell>
                  <TableCell>${Number(order.amount ?? order.totalAmount ?? 0).toLocaleString()}</TableCell>
                  <TableCell>{order.date || (order.createdAt ? String(order.createdAt).split('T')[0] : '-')}</TableCell>
                  <TableCell>
                    <Chip label={order.status} color={getStatusColor(order.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    {canCreateEdit && (
                      <IconButton size="small" onClick={() => handleOpenDialog(order)} title="Edit">
                        <EditIcon />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" title="Delete" onClick={() => dispatch(deletePurchaseOrder(order._id || order.id))}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Supplier (type name/email)"
            margin="normal"
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            helperText="Free text input. Use existing supplier name/email."
          />

          <TextField
            fullWidth
            label="Product (type name/SKU)"
            margin="normal"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            helperText="Free text input. Use existing product name/SKU."
          />

          <TextField
            fullWidth
            label="Quantity"
            type="number"
            margin="normal"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Unit Price"
            type="number"
            margin="normal"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Total Amount"
            type="number"
            margin="normal"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
