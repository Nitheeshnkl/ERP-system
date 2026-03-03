import { Box, Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', color: '#d32f2f', mb: 2 }}>
          403
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, color: '#666' }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: '#999' }}>
          Your role does not have permission to access this resource.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  )
}
