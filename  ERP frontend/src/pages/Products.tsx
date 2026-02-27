import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Add as AddIcon } from '@mui/icons-material'
import { RootState, AppDispatch } from '../app/store'
import { hasAnyRole } from '../utils/roleUtils'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setSearchFilter,
  clearError,
} from '../features/products/productsSlice'
import { Product } from '../types/entities'

export default function Products() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, error, filters } = useSelector((state: RootState) => state.products)
  const { user } = useSelector((state: RootState) => state.auth)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    stock: 0,
    reorderLevel: 0,
    unit: '',
  })

  // Permissions (case-insensitive)
  const canCreateEdit = hasAnyRole(user?.role, ['Admin', 'Inventory'])
  const canDelete = hasAnyRole(user?.role, ['Admin'])

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const filteredProducts = items.filter((product) => {
    const searchTerm = filters.search?.toLowerCase() || ''
    const matchesSearch =
      (product.name?.toLowerCase() || '').includes(searchTerm) ||
      (product.sku?.toLowerCase() || '').includes(searchTerm)
    const matchesLowStock = !filters.lowStockOnly || product.stock <= product.reorderLevel
    return matchesSearch && matchesLowStock
  })

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData(product)
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        sku: '',
        description: '',
        price: 0,
        stock: 0,
        reorderLevel: 0,
        unit: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProduct(null)
  }

  const handleSave = () => {
    if (!formData.name || !formData.sku) {
      alert('Name and SKU are required')
      return
    }

    if (editingProduct) {
      dispatch(updateProduct({ ...editingProduct, ...formData }))
    } else {
      dispatch(createProduct(formData))
    }
    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id))
    }
  }

  const columns: GridColDef[] = [
    { field: 'sku', headerName: 'SKU', width: 100 },
    { field: 'name', headerName: 'Product Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 200, sortable: false },
    { field: 'price', headerName: 'Price', width: 100, type: 'number' },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      type: 'number',
      cellClassName: (params) => {
        const stock = params.value
        const reorderLevel = params.row.reorderLevel
        return stock <= reorderLevel ? 'low-stock' : ''
      },
    },
    {
      field: 'reorderLevel',
      headerName: 'Reorder Level',
      width: 120,
      type: 'number',
    },
    { field: 'unit', headerName: 'Unit', width: 80 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canCreateEdit && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpenDialog(params.row)}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </Button>
          )}
          {!canCreateEdit && !canDelete && (
            <Typography variant="caption" sx={{ color: '#999' }}>
              No actions
            </Typography>
          )}
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Products
        </Typography>
        {canCreateEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Search by name or SKU"
                variant="outlined"
                value={filters.search}
                onChange={(e) => dispatch(setSearchFilter(e.target.value))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={filteredProducts}
              getRowId={(row) => row.id || row._id || row.sku}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              sx={{
                '& .low-stock': {
                  backgroundColor: '#ffebee',
                  color: '#d32f2f',
                  fontWeight: 600,
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Product Name"
            variant="outlined"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="SKU"
            variant="outlined"
            margin="normal"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            fullWidth
            label="Price"
            variant="outlined"
            margin="normal"
            type="number"
            inputProps={{ step: '0.01' }}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Stock"
            variant="outlined"
            margin="normal"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Reorder Level"
            variant="outlined"
            margin="normal"
            type="number"
            value={formData.reorderLevel}
            onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Unit"
            variant="outlined"
            margin="normal"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
