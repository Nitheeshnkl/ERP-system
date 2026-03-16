import React from 'react'
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material'

interface EmailVerificationModalProps {
  open: boolean
  onClose: () => void
  onResend: () => void
  email: string
  otp: string
  loading: boolean
  error?: string
  success?: string
  onEmailChange: (value: string) => void
  onOtpChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export default function EmailVerificationModal({
  open,
  onClose,
  onResend,
  email,
  otp,
  loading,
  error,
  success,
  onEmailChange,
  onOtpChange,
  onSubmit,
}: EmailVerificationModalProps) {
  if (!open) return null

  return (
    <div className="otp-overlay" role="dialog" aria-modal="true" aria-labelledby="email-verify-title">
      <div className="otp-modal">
        <Typography id="email-verify-title" variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          Email Verification
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#757575' }}>
          An OTP has been sent to your email. Enter it below to activate your account.
        </Typography>
        {(error || success) && (
          <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }}>
            {error || success}
          </Alert>
        )}
        <Box component="form" onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="OTP"
            margin="normal"
            value={otp}
            onChange={(e) => onOtpChange(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button type="button" variant="outlined" fullWidth onClick={onResend} disabled={loading}>
            Resend OTP
          </Button>
          <Button type="button" variant="text" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </Box>
      </div>
    </div>
  )
}
