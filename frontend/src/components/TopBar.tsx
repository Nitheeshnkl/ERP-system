import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography,
} from '@mui/material'
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material'
import { RootState, AppDispatch } from '../app/store'
import { logout } from '../features/auth/authSlice'
import { DRAWER_WIDTH } from './Sidebar'

interface TopBarProps {
  onMenuOpen: () => void
}

export default function TopBar({ onMenuOpen }: TopBarProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    handleMenuClose()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        marginLeft: { xs: 0, md: `${DRAWER_WIDTH}px` },
        width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        backgroundColor: '#ffffff',
        color: '#212121',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuOpen}
          sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#757575', textTransform: 'capitalize' }}
            >
              {user?.role}
            </Typography>
          </Box>

          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              width: 40,
              height: 40,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#1976d2',
                cursor: 'pointer',
              }}
            >
              {user?.name ? getInitials(user.name) : 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.email}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
