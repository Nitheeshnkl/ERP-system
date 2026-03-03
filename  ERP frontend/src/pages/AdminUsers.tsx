import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import axiosInstance from '../services/axiosInstance'

type UserRole = 'Admin' | 'Sales' | 'Purchase' | 'Inventory'

interface AdminUser {
  _id?: string
  id?: string
  name: string
  email: string
  role: UserRole
  active?: boolean
}

const ROLE_OPTIONS: UserRole[] = ['Admin', 'Sales', 'Purchase', 'Inventory']

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [openCreate, setOpenCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sales' as UserRole,
  })

  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({})

  const loadUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.get('/auth/users')
      const userList = Array.isArray(response.data) ? response.data : []
      setUsers(userList)
      setRoleDrafts(
        userList.reduce((acc: Record<string, UserRole>, user: AdminUser) => {
          const key = String(user._id || user.id)
          acc[key] = user.role
          return acc
        }, {})
      )
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const activeUsers = useMemo(() => users.filter((user) => user.active !== false).length, [users])

  const handleCreateUser = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setError('Name, email, and password are required')
      return
    }

    setCreating(true)
    setError(null)

    try {
      await axiosInstance.post('/auth/register', {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      })

      setSuccess('User created successfully')
      setOpenCreate(false)
      setCreateForm({ name: '', email: '', password: '', role: 'Sales' })
      await loadUsers()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const handleRoleChange = async (user: AdminUser) => {
    const key = String(user._id || user.id)
    const nextRole = roleDrafts[key]

    if (!nextRole || nextRole === user.role) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await axiosInstance.put(`/auth/users/${key}`, { role: nextRole })
      setSuccess(`Role updated for ${user.email}`)
      await loadUsers()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Failed to update role')
    }
  }

  const handleToggleActivation = async (user: AdminUser) => {
    const key = String(user._id || user.id)
    const nextActive = !(user.active !== false)

    setError(null)
    setSuccess(null)

    try {
      await axiosInstance.put(`/auth/users/${key}`, { active: nextActive })
      setSuccess(nextActive ? `User activated: ${user.email}` : `User deactivated: ${user.email}`)
      await loadUsers()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Failed to change user status')
    }
  }

  return (
    <Box>
      {(error || success) && (
        <Alert
          severity={error ? 'error' : 'success'}
          onClose={() => {
            setError(null)
            setSuccess(null)
          }}
          sx={{ mb: 2 }}
        >
          {error || success}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={2} spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Admin User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total users: {users.length} | Active users: {activeUsers}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          Create User
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const key = String(user._id || user.id)
                const isActive = user.active !== false
                return (
                  <TableRow key={key} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell sx={{ minWidth: 190 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`role-${key}`}>Role</InputLabel>
                        <Select
                          labelId={`role-${key}`}
                          value={roleDrafts[key] || user.role}
                          label="Role"
                          onChange={(event) => {
                            const nextRole = event.target.value as UserRole
                            setRoleDrafts((prev) => ({ ...prev, [key]: nextRole }))
                          }}
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <MenuItem key={role} value={role}>
                              {role}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>{isActive ? 'Active' : 'Deactivated'}</TableCell>
                    <TableCell align="right">
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => handleRoleChange(user)}
                          disabled={(roleDrafts[key] || user.role) === user.role}
                        >
                          Save Role
                        </Button>
                        <Button
                          variant={isActive ? 'outlined' : 'contained'}
                          color={isActive ? 'error' : 'success'}
                          onClick={() => handleToggleActivation(user)}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={createForm.name}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel id="create-role">Role</InputLabel>
              <Select
                labelId="create-role"
                value={createForm.role}
                label="Role"
                onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
