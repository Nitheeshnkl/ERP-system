import { Component, ReactNode, ErrorInfo } from 'react'
import { Box, Container, Paper, Button, Typography } from '@mui/material'
import { Error as ErrorIcon } from '@mui/icons-material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            p: 2,
          }}
        >
          <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <ErrorIcon sx={{ fontSize: 64, color: '#d32f2f', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#212121' }}>
                Something went wrong
              </Typography>
              <Typography variant="body1" sx={{ color: '#757575', mb: 3 }}>
                {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
              </Typography>
              <Button variant="contained" onClick={this.handleReset}>
                Try again
              </Button>
              <Button
                variant="outlined"
                sx={{ ml: 1 }}
                onClick={() => (window.location.href = '/')}
              >
                Go to Home
              </Button>
            </Paper>
          </Container>
        </Box>
      )
    }

    return this.props.children
  }
}
