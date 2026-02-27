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

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  status: 'active' | 'inactive'
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'ABC Corporation',
    email: 'contact@abc.com',
    phone: '+1-555-0101',
    city: 'New York',
    status: 'active',
  },
  {
    id: '2',
    name: 'XYZ Industries',
    email: 'sales@xyz.com',
    phone: '+1-555-0102',
    city: 'Los Angeles',
    status: 'active',
  },
  {
    id: '3',
    name: 'Tech Solutions Ltd',
    email: 'info@techsol.com',
    phone: '+1-555-0103',
    city: 'Chicago',
    status: 'active',
  },
  {
    id: '4',
    name: 'Global Imports',
    email: 'orders@global.com',
    phone: '+1-555-0104',
    city: 'Houston',
    status: 'inactive',
  },
  {
    id: '5',
    name: 'Premium Trading',
    email: 'trade@premium.com',
    phone: '+1-555-0105',
    city: 'Phoenix',
    status: 'active',
  },
]

export default function Customers() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    city: '',
    status: 'active',
  })

  // Check permissions - customers are admin+sales (case-insensitive)
  const canCreateEdit = hasAnyRole(user?.role, ['Admin', 'Sales'])
  const canDelete = hasAnyRole(user?.role, ['Admin'])

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData(customer)
    } else {
      setEditingCustomer(null)
      setFormData({ name: '', email: '', phone: '', city: '', status: 'active' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCustomer(null)
  }

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required')
      return
    }

    if (editingCustomer) {
      setCustomers(
        customers.map((c) => (c.id === editingCustomer.id ? { ...editingCustomer, ...formData } : c))
      )
    } else {
      setCustomers([...customers, { id: Date.now().toString(), ...formData }])
    }
    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter((c) => c.id !== id))
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Customers
        </Typography>
        {canCreateEdit && (
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => handleOpenDialog()}>
            Add Customer
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
              <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.city}</TableCell>
                <TableCell>
                  <Chip
                    label={customer.status}
                    color={customer.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {canCreateEdit && (
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(customer)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {canDelete && (
                    <IconButton size="small" onClick={() => handleDelete(customer.id)} title="Delete">
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
        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
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
            label="City"
            margin="normal"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
