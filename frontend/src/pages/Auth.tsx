import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { RootState, AppDispatch } from '../app/store'
import { login, register, clearError } from '../features/auth/authSlice'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Auth() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth)

  const [tabValue, setTabValue] = useState(0)
  const [validationError, setValidationError] = useState('')

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up State
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpRole, setSignUpRole] = useState('Inventory')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const state = location.state as { openSignup?: boolean; prefillEmail?: string } | null
    if (state?.openSignup) {
      setTabValue(1)
      setSignUpEmail(state.prefillEmail || '')
    }
  }, [location.state])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setValidationError('')
    dispatch(clearError())
  }

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!signInEmail.trim() || !signInPassword.trim()) {
      setValidationError('Email and password are required')
      return
    }

    dispatch(login({ email: signInEmail, password: signInPassword }))
  }

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setValidationError('Name, email, and password are required')
      return
    }

    const result = await dispatch(register({ name: signUpName, email: signUpEmail, password: signUpPassword, role: signUpRole }))

    if (register.fulfilled.match(result)) {
      const response = result.payload as { success?: boolean } | undefined
      setValidationError('')
      setSignUpName('')
      const registeredEmail = signUpEmail.trim()
      setSignUpEmail('')
      setSignUpPassword('')
      setSignUpRole('Inventory')
      navigate('/verify-email', { state: { email: registeredEmail, showVerifyModal: response?.success === true } })
    }
  }

  const handleClearError = () => {
    dispatch(clearError())
    setValidationError('')
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
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h3" component="h1" sx={{ mb: 1, fontWeight: 700, color: '#1976d2' }}>
            ERP System
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#757575' }}>
            Enterprise Resource Planning Management
          </Typography>

          {(error || validationError) && (
            <Alert severity="error" onClose={handleClearError} sx={{ mb: 2, width: '100%' }}>
              {error || validationError}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="auth-tabs">
              <Tab label="Sign In" id="auth-tab-0" aria-controls="auth-tabpanel-0" />
              <Tab label="Sign Up" id="auth-tab-1" aria-controls="auth-tabpanel-1" />
            </Tabs>
          </Box>

          {/* Sign In Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleSignInSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                type="email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                disabled={loading}
                placeholder="Enter your email"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter your password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>

          </TabPanel>

          {/* Sign Up Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleSignUpSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                margin="normal"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                disabled={loading}
                placeholder="Enter your full name"
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                margin="normal"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                disabled={loading}
                placeholder="Enter your email"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter your password (min. 6 characters)"
              />

              <FormControl fullWidth margin="normal" disabled={loading}>
                <InputLabel>Role</InputLabel>
                <Select value={signUpRole} onChange={(e) => setSignUpRole(e.target.value)} label="Role">
                  <MenuItem value="Inventory">Inventory</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Purchase">Purchase</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
                Note: Admin role can only be assigned by existing admins.
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>

              <Typography variant="body2" sx={{ color: '#757575', textAlign: 'center' }}>
                Already have an account?{' '}
                <Box
                  component="span"
                  onClick={() => {
                    setTabValue(0)
                    setValidationError('')
                    dispatch(clearError())
                  }}
                  sx={{ cursor: 'pointer', color: '#1976d2', fontWeight: 'bold' }}
                >
                  Sign In here
                </Box>
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  )
}
