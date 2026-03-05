import { useState } from 'react'
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

  const [email, setEmail] = useState(prefilledEmail)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
