import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, IconButton, Snackbar, Stack, TextField } from '@mui/material'
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import { AppDispatch, RootState } from '../app/store'
import { hasAnyRole } from '../utils/roleUtils'
import PageLayout from '../components/shared/PageLayout'
import DataTable from '../components/shared/DataTable'
import FormModal from '../components/shared/FormModal'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import { createCustomer, deleteCustomer, fetchCustomers, updateCustomer } from '../features/customers/customersSlice'

type CustomerForm = {
  name: string
  email: string
  phone: string
  address: string
}

const initialForm: CustomerForm = { name: '', email: '', phone: '', address: '' }

export default function Customers() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { items, meta, loading } = useSelector((state: RootState) => state.customers)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<CustomerForm>(initialForm)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const canCreateEdit = hasAnyRole(user?.role, ['Admin', 'Sales'])
  const canDelete = hasAnyRole(user?.role, ['Admin'])

  const load = () => dispatch(fetchCustomers({ page, limit, search }))

  useEffect(() => {
    load()
  }, [dispatch, page, limit, search])

  const openCreate = () => {
    setEditingId(null)
    setForm(initialForm)
    setOpenForm(true)
  }

  const openEdit = (row: any) => {
    setEditingId(row.id)
    setForm({
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
    })
    setOpenForm(true)
  }

  const onSubmit = async () => {
    if (!form.name || !form.email) {
      setSnackbar({ open: true, message: 'Name and email are required', severity: 'error' })
      return
    }

    try {
      if (editingId) {
        await dispatch(updateCustomer({ id: editingId, payload: form })).unwrap()
        setSnackbar({ open: true, message: 'Customer updated', severity: 'success' })
      } else {
        await dispatch(createCustomer(form)).unwrap()
        setSnackbar({ open: true, message: 'Customer created', severity: 'success' })
      }
      setOpenForm(false)
      load()
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Operation failed', severity: 'error' })
    }
  }

  const askDelete = (id: string) => {
    setDeletingId(id)
    setOpenDelete(true)
  }

  const onDelete = async () => {
    if (!deletingId) return
    try {
      await dispatch(deleteCustomer(deletingId)).unwrap()
      setSnackbar({ open: true, message: 'Customer deleted', severity: 'success' })
      setOpenDelete(false)
      setDeletingId(null)
      load()
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Delete failed', severity: 'error' })
    }
  }

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 180 },
      { field: 'email', headerName: 'Email', flex: 1.4, minWidth: 220 },
      { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 140 },
      { field: 'address', headerName: 'Address', flex: 1.5, minWidth: 220 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <>
            {canCreateEdit && (
              <IconButton size="small" onClick={() => openEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {canDelete && (
              <IconButton size="small" onClick={() => askDelete(params.row.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </>
        ),
      },
    ],
    [canCreateEdit, canDelete]
  )

  const onPageChange = (model: GridPaginationModel) => {
    setPage(model.page + 1)
    setLimit(model.pageSize)
  }

  return (
    <PageLayout title="Customers" actionLabel={canCreateEdit ? 'Add Customer' : undefined} onAction={openCreate}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
        />
      </Stack>

      <DataTable
        rows={items}
        columns={columns}
        loading={loading}
        page={meta.page || page}
        pageSize={meta.pageSize || limit}
        rowCount={meta.total || 0}
        onPaginationModelChange={onPageChange}
      />

      <FormModal
        open={openForm}
        title={editingId ? 'Edit Customer' : 'Add Customer'}
        onClose={() => setOpenForm(false)}
        onSubmit={onSubmit}
      >
        <Stack spacing={2} mt={1}>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Stack>
      </FormModal>

      <ConfirmDialog
        open={openDelete}
        title="Delete Customer"
        description="This action cannot be undone. Do you want to continue?"
        onCancel={() => setOpenDelete(false)}
        onConfirm={onDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </PageLayout>
  )
}
