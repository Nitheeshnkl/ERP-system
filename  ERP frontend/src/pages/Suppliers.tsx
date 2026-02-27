import { useState } from 'react'
import { useSelector } from 'react-redux'
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
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { RootState } from '../app/store'
import { hasAnyRole } from '../utils/roleUtils'

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  rating: number
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Premium Suppliers',
    email: 'contact@premium.com',
    phone: '+1-555-1001',
    address: '123 Business St, NY',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Quality Materials Inc',
    email: 'sales@quality.com',
    phone: '+1-555-1002',
    address: '456 Industrial Ave, CA',
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Direct Trade Partners',
    email: 'trade@directpartners.com',
    phone: '+1-555-1003',
    address: '789 Commerce Blvd, TX',
    rating: 4.8,
  },
  {
    id: '4',
    name: 'Bulk Distributors',
    email: 'bulk@distributors.com',
    phone: '+1-555-1004',
    address: '321 Wholesale Rd, FL',
    rating: 3.9,
  },
  {
    id: '5',
    name: 'Reliable Traders',
    email: 'info@reliable.com',
    phone: '+1-555-1005',
    address: '654 Supply Chain Way, OH',
    rating: 4.6,
  },
]

export default function Suppliers() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    rating: 0,
  })

  // Check permissions - suppliers are admin+purchase (case-insensitive)
  const canCreateEdit = hasAnyRole(user?.role, ['Admin', 'Purchase'])
  const canDelete = hasAnyRole(user?.role, ['Admin'])

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setFormData(supplier)
    } else {
      setEditingSupplier(null)
      setFormData({ name: '', email: '', phone: '', address: '', rating: 0 })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingSupplier(null)
  }

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required')
      return
    }

    if (editingSupplier) {
      setSuppliers(
        suppliers.map((s) => (s.id === editingSupplier.id ? { ...editingSupplier, ...formData } : s))
      )
    } else {
      setSuppliers([...suppliers, { id: Date.now().toString(), ...formData }])
    }
    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter((s) => s.id !== id))
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Suppliers
        </Typography>
        {canCreateEdit && (
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => handleOpenDialog()}>
            Add Supplier
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} hover>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.address}</TableCell>
                <TableCell>
                  <Chip
                    label={`${supplier.rating} ⭐`}
                    color={supplier.rating >= 4.5 ? 'success' : supplier.rating >= 4 ? 'info' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {canCreateEdit && (
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(supplier)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {canDelete && (
                    <IconButton size="small" onClick={() => handleDelete(supplier.id)} title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Phone"
            margin="normal"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="Address"
            margin="normal"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <TextField
            fullWidth
            label="Rating (0-5)"
            type="number"
            margin="normal"
            inputProps={{ min: 0, max: 5, step: 0.1 }}
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
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
