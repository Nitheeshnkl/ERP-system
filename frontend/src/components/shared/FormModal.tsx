import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material'
import { ReactNode } from 'react'

interface FormModalProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit: () => void
  submitLabel?: string
  children: ReactNode
}

export default function FormModal({ open, title, onClose, onSubmit, submitLabel = 'Save', children }: FormModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>{submitLabel}</Button>
      </DialogActions>
    </Dialog>
  )
}
