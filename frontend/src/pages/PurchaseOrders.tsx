import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Button,
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
  Stack,
  TextField,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, RemoveCircleOutline as RemoveIcon } from '@mui/icons-material'
import { RootState, AppDispatch } from '../app/store'
import { hasAnyRole } from '../utils/roleUtils'
import { fetchPurchaseOrders, clearError, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../features/orders/ordersSlice'
import EntitySelect from '../components/shared/EntitySelect'
import QuickCreateModal from '../components/shared/QuickCreateModal'
import { EntityOption, EntityType } from '../types/entity'
import { ENTITY_CONFIG } from '../utils/entityConfig'

// Debug logging helper
const debugLog = (label: string, data: any) => {
  console.log(`[DEBUG ${label}]`, JSON.parse(JSON.stringify(data)))
}

const objectIdRegex = /^[a-f\d]{24}$/i

// Line item type
interface LineItem {
  id: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number | ''
}

export default function PurchaseOrders() {
  const dispatch = useDispatch<AppDispatch>()
  const { purchaseOrders: orders, loading, error } = useSelector((state: RootState) => state.orders)
  const { user } = useSelector((state: RootState) => state.auth)

  const [openDialog, setOpenDialog] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [quickCreateEntity, setQuickCreateEntity] = useState<EntityType | null>(null)
  const [supplierOptions, setSupplierOptions] = useState<EntityOption[]>([])
  const [productOptions, setProductOptions] = useState<EntityOption[]>([])
  const [refreshTokens, setRefreshTokens] = useState({ supplier: 0, product: 0 })

  // Form state with support for multiple line items
  const [formData, setFormData] = useState({
    supplierId: '',
    items: [] as LineItem[],
    status: 'Pending',
  })

  // Calculate total from items
  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + (Number(item.quantity) * (Number(item.unitPrice) || 0)), 0)
  }, [formData.items])

  const canCreateEdit = hasAnyRole(user?.role, ['Admin', 'Purchase'])
  const canDelete = hasAnyRole(user?.role, ['Admin'])

  useEffect(() => {
    dispatch(fetchPurchaseOrders())
  }, [dispatch])

  const handleOpenDialog = (order?: any) => {
    setValidationError(null)
    if (order) {
      // Edit mode: load all existing items
      setEditingOrder(order)
      
      // Debug: Log the fetched order data
      debugLog('EDIT_FETCH_RESPONSE', order)
      
      // Extract all line items from the order
      const loadedItems: LineItem[] = Array.isArray(order.items) 
        ? order.items.map((item: any, index: number) => ({
            id: item._id || `temp-${index}`,
            productId: item.productId?._id || item.productId || '',
            productName: item.productName || item.productId?.name || '',
            quantity: Number(item.quantity) || 1,
            unitPrice: item.unitPrice === '' ? '' : (Number(item.unitPrice) || 0),
          }))
        : []
      
      // Debug: Log loaded items
      debugLog('EDIT_ITEMS_LOADED', loadedItems)
      
      setFormData({
        supplierId: order.supplierId?._id || order.supplierId || '',
        items: loadedItems,
        status: order.status || 'Pending',
      })
      
      // Debug: Log form state after preload
      debugLog('EDIT_FORM_STATE_AFTER_PRELOAD', {
        supplierId: order.supplierId?._id || order.supplierId || '',
        items: loadedItems,
        status: order.status || 'Pending',
      })
    } else {
      // Create mode: reset to empty
      setEditingOrder(null)
      setFormData({
        supplierId: '',
        items: [],
        status: 'Pending',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingOrder(null)
    setValidationError(null)
    setFormData({
      supplierId: '',
      items: [],
      status: 'Pending',
    })
  }

  const isFormValid = useMemo(() => {
    // Check supplier ID is valid
    if (!objectIdRegex.test(String(formData.supplierId).trim())) {
      return false
    }
    // Check at least one item exists with valid product and quantity
    if (formData.items.length === 0) {
      return false
    }
    // Check each item has valid product and quantity
    return formData.items.every(
      (item) =>
        objectIdRegex.test(String(item.productId).trim()) &&
        Number(item.quantity) > 0
    )
  }, [formData.supplierId, formData.items])

  const handleSave = () => {
    // Validate supplier
    if (!formData.supplierId) {
      setValidationError('Supplier is required')
      return
    }

    if (!objectIdRegex.test(String(formData.supplierId).trim())) {
      setValidationError('Invalid Supplier ID')
      return
    }

    // Validate items
    if (formData.items.length === 0) {
      setValidationError('At least one product is required')
      return
    }

    // Validate each item
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i]
      
      if (!objectIdRegex.test(String(item.productId).trim())) {
        setValidationError(`Invalid Product ID for item ${i + 1}`)
        return
      }

      if (Number(item.quantity) < 1) {
        setValidationError(`Quantity must be at least 1 for item ${i + 1}`)
        return
      }
    }

    // Build the payload with all line items
    const itemsPayload = formData.items.map((item) => ({
      productId: String(item.productId).trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice) || 0,
    }))

    const payload = {
      supplierId: String(formData.supplierId).trim(),
      items: itemsPayload,
      totalAmount: totalAmount,
      status: formData.status || 'Pending',
    }

    // Debug: Log the update payload
    debugLog('UPDATE_PAYLOAD', payload)

    const orderId = String(editingOrder?._id || editingOrder?.id || '').trim()
    const isUpdateMode = orderId !== ''
    console.log('SAVE MODE:', isUpdateMode ? 'UPDATE' : 'CREATE')

    if (isUpdateMode) {
      // Debug: Log that we're dispatching update
      console.log('[DEBUG DISPATCH] updatePurchaseOrder called with id:', orderId)
      dispatch(updatePurchaseOrder({ id: orderId, data: payload }))
    } else {
      dispatch(createPurchaseOrder(payload))
    }
    handleCloseDialog()
  }

  // Add a new empty line item
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `temp-${Date.now()}`,
          productId: '',
          quantity: 1,
          unitPrice: '',
        },
      ],
    }))
  }

  // Update a specific line item
  const handleUpdateItem = (index: number, field: keyof LineItem, value: any) => {
    setFormData((prev) => {
      const newItems = [...prev.items]
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      }
      return { ...prev, items: newItems }
    })
  }

  // Remove a line item
  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleCreatedEntity = (entity: EntityOption) => {
    if (quickCreateEntity === 'supplier') {
      setRefreshTokens((prev) => ({ ...prev, supplier: prev.supplier + 1 }))
      setFormData((prev) => ({ ...prev, supplierId: entity.id }))
      return
    }
    if (quickCreateEntity === 'product') {
      setRefreshTokens((prev) => ({ ...prev, product: prev.product + 1 }))
      setFormData((prev) => ({ ...prev, productId: entity.id }))
    }
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

  const quickCreateCanCreate = quickCreateEntity
    ? hasAnyRole(user?.role, ENTITY_CONFIG[quickCreateEntity].createRoles)
    : false

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
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} mt={1}>
            {/* Supplier Selection */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <EntitySelect
                entityType="supplier"
                value={formData.supplierId}
                onChange={(id) => setFormData((prev) => ({ ...prev, supplierId: id }))}
                required
                refreshToken={refreshTokens.supplier}
                onOptionsChange={setSupplierOptions}
              />
              <Button variant="outlined" onClick={() => setQuickCreateEntity('supplier')}>+ Add New</Button>
            </Stack>

            {/* Line Items Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Products
                </Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  size="small" 
                  onClick={handleAddItem}
                  variant="outlined"
                >
                  Add Item
                </Button>
              </Box>
              
              {formData.items.length === 0 ? (
                <Typography color="textSecondary" sx={{ py: 2 }}>
                  No items added. Click "Add Item" to add products.
                </Typography>
              ) : (
                <>
                  {/* Header Row */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1, px: 1 }}>
                    <Box sx={{ flex: 2 }}><Typography variant="caption">Product</Typography></Box>
                    <Box sx={{ flex: 1 }}><Typography variant="caption">Quantity</Typography></Box>
                    <Box sx={{ flex: 1 }}><Typography variant="caption">Unit Price</Typography></Box>
                    <Box sx={{ flex: 1 }}><Typography variant="caption">Total</Typography></Box>
                    <Box sx={{ width: 40 }}></Box>
                  </Stack>
                  
                  {/* Item Rows */}
                  {formData.items.map((item, index) => (
                    <Stack key={item.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
                      <Box sx={{ flex: 2 }}>
                        <EntitySelect
                          entityType="product"
                          value={item.productId}
                          onChange={(id) => handleUpdateItem(index, 'productId', id)}
                          required
                          refreshToken={refreshTokens.product}
                          onOptionsChange={setProductOptions}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          inputProps={{ min: 1 }}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', Number(e.target.value) || 0)}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          inputProps={{ min: 0 }}
                          value={item.unitPrice}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              handleUpdateItem(index, 'unitPrice', '')
                              return
                            }
                            handleUpdateItem(index, 'unitPrice', Number(value))
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 500 }}>
                          ${(Number(item.quantity) * (Number(item.unitPrice) || 0)).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ width: 40 }}>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleRemoveItem(index)}
                          disabled={formData.items.length <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </Stack>
                  ))}
                </>
              )}
            </Box>

            {/* Total Amount Display */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                Total: ${totalAmount.toLocaleString()}
              </Typography>
            </Box>

            {/* Status */}
            <TextField
              select
              fullWidth
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              SelectProps={{ native: true }}
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!isFormValid || loading}>Save</Button>
        </DialogActions>
      </Dialog>

      {quickCreateEntity ? (
        <QuickCreateModal
          entityType={quickCreateEntity}
          open={Boolean(quickCreateEntity)}
          canCreate={quickCreateCanCreate}
          existingOptions={quickCreateEntity === 'supplier' ? supplierOptions : productOptions}
          onClose={() => setQuickCreateEntity(null)}
          onCreated={handleCreatedEntity}
        />
      ) : null}
    </Box>
  )
}
