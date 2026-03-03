import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import axiosInstance from '../../services/axiosInstance'
import { EntityOption, EntityType } from '../../types/entity'
import { ENTITY_CONFIG } from '../../utils/entityConfig'

interface QuickCreateModalProps {
  entityType: EntityType
  open: boolean
  canCreate: boolean
  existingOptions: EntityOption[]
  onClose: () => void
  onCreated: (item: EntityOption) => void
}

const buildInitialForm = (entityType: EntityType): Record<string, string> => {
  const form: Record<string, string> = {}
  for (const field of ENTITY_CONFIG[entityType].fields) {
    form[field.key] = ''
  }
  return form
}

export default function QuickCreateModal({
  entityType,
  open,
  canCreate,
  existingOptions,
  onClose,
  onCreated,
}: QuickCreateModalProps) {
  const config = ENTITY_CONFIG[entityType]
  const [form, setForm] = useState<Record<string, string>>(buildInitialForm(entityType))
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDuplicate, setConfirmDuplicate] = useState<EntityOption | null>(null)
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(entityType))
      setErrors([])
      setIsSubmitting(false)
      setConfirmDuplicate(null)
    }
  }, [entityType, open])

  const duplicateCandidate = useMemo(() => {
    const name = String(form.name || '').trim().toLowerCase()
    if (!name) return null
    return existingOptions.find((item) => item.name.trim().toLowerCase() === name) || null
  }, [existingOptions, form.name])

  const submitCreate = async () => {
    const validationErrors = config.validateCreate(form)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    if (duplicateCandidate && !confirmDuplicate) {
      setConfirmDuplicate(duplicateCandidate)
      return
    }

    setErrors([])
    setIsSubmitting(true)

    try {
      const payload = config.toCreatePayload(form)
      const response: any = await axiosInstance.post(config.endpoint, payload)
      const created = config.toOption(response.data)
      setToast({ open: true, message: `${config.singular} created successfully`, severity: 'success' })
      onCreated(created)
      onClose()
    } catch (error: any) {
      const message = String(error?.response?.data?.message || error?.message || `Failed to create ${config.singular.toLowerCase()}`)
      setErrors([message])
      setToast({ open: true, message, severity: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitDisabled = isSubmitting || !canCreate

  return (
    <>
      <Dialog open={open} onClose={() => (isSubmitting ? null : onClose())} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Create {config.singular}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {!canCreate ? (
              <Alert severity="warning">You do not have permission to create {config.singular.toLowerCase()} records.</Alert>
            ) : null}

            {errors.length > 0 ? (
              <Alert severity="error">
                {errors.map((item) => (
                  <Typography key={item} variant="body2">{item}</Typography>
                ))}
              </Alert>
            ) : null}

            {confirmDuplicate ? (
              <Alert severity="warning">
                Similar record already exists. Do you want to use it?
                <Stack direction="row" spacing={1} mt={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      onCreated(confirmDuplicate)
                      onClose()
                    }}
                  >
                    Use Existing
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => submitCreate()}
                  >
                    Create Anyway
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setConfirmDuplicate(null)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Alert>
            ) : null}

            {config.fields.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                type={field.type}
                value={form[field.key] || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                required={Boolean(field.required)}
                fullWidth
                disabled={submitDisabled}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="contained" onClick={submitCreate} disabled={submitDisabled}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
      </Snackbar>
    </>
  )
}
