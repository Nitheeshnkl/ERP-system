import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import axiosInstance from '../services/axiosInstance'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefilledEmail = (location.state as any)?.email || ''
  const otpSentFromState = Boolean((location.state as any)?.otpSent)

  const [email, setEmail] = useState(prefilledEmail)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showOtpNotification, setShowOtpNotification] = useState(otpSentFromState)

  useEffect(() => {
    if (!showOtpNotification) return
    const timer = window.setTimeout(() => setShowOtpNotification(false), 5000)
    return () => window.clearTimeout(timer)
  }, [showOtpNotification])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !otp.trim()) {
      setError('Email and OTP are required')
      return
    }

    try {
      setLoading(true)
      await axiosInstance.post('/auth/verify-email', { email: email.trim(), otp: otp.trim() })
      setSuccess('Email verified successfully')
      window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 700)
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {showOtpNotification && (
        <div className="otp-notification">
          <div className="otp-notification-title">Verification Email Sent</div>
          <div className="otp-notification-body">
            A One-Time Password (OTP) has been sent to your email address.
            Please check your inbox and enter the code to continue verification.
            If you cannot find the email within a minute, kindly check your
            Spam or Junk folder as well.
          </div>
          <div className="otp-notification-footer">
            For security reasons the OTP will expire in 5 minutes.
          </div>
        </div>
      )}
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#1976d2' }}>
            Verify Email
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#757575' }}>
            Enter your email and OTP to activate your account.
          </Typography>

          {(error || success) && (
            <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }}>
              {error || success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="OTP"
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
