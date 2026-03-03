import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import Sidebar, { DRAWER_WIDTH } from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleDrawerClose = () => {
    setMobileOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerClose} />
      <TopBar onMenuOpen={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          p: { xs: 2, md: 3 },
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
