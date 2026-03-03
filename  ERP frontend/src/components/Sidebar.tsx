import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  Description as DescriptionIcon,
  ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material'
import { RootState } from '../app/store'

const DRAWER_WIDTH = 260

interface MenuItem {
  label: string
  path: string
  icon: React.ReactNode
  allowedRoles: string[] // Empty array means accessible to all authenticated users
}

// Define menu items with correct backend roles: 'Admin', 'Sales', 'Purchase', 'Inventory'
// Empty allowedRoles array means the page is accessible to all authenticated users
const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    allowedRoles: [], // All authenticated users
  },
  {
    label: 'Products',
    path: '/products',
    icon: <InventoryIcon />,
    allowedRoles: [], // All roles can view products
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: <PeopleIcon />,
    allowedRoles: ['Admin', 'Sales'], // Only admin and sales
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: <BusinessIcon />,
    allowedRoles: ['Admin', 'Purchase'], // Only admin and purchase
  },
  {
    label: 'Sales Orders',
    path: '/sales-orders',
    icon: <ShoppingCartIcon />,
    allowedRoles: ['Admin', 'Sales'],
  },
  {
    label: 'Purchase Orders',
    path: '/purchase-orders',
    icon: <ReceiptIcon />,
    allowedRoles: ['Admin', 'Purchase'],
  },
  {
    label: 'GRN',
    path: '/grn',
    icon: <ShippingIcon />,
    allowedRoles: ['Admin', 'Purchase', 'Inventory'],
  },
  {
    label: 'Invoices',
    path: '/invoices',
    icon: <DescriptionIcon />,
    allowedRoles: ['Admin', 'Sales'], // Only admin and sales
  },
  {
    label: 'Admin Users',
    path: '/admin/users',
    icon: <ManageAccountsIcon />,
    allowedRoles: ['Admin'],
  },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

/**
 * Normalize role for safe comparison (case-insensitive)
 * Backend may return 'Admin', 'Sales', etc.
 */
function normalizeRole(role: string | undefined): string {
  return (role || '').toLowerCase().trim()
}

/**
 * Check if user role is allowed for a menu item
 * Empty allowedRoles means all authenticated users can access
 */
function isRoleAllowed(userRole: string | undefined, allowedRoles: string[]): boolean {
  // If no role restrictions, all authenticated users can access
  if (allowedRoles.length === 0) {
    return true
  }

  // Check if user's role is in allowed roles (case-insensitive)
  if (!userRole) {
    return false
  }

  const normalizedUserRole = normalizeRole(userRole)
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole)

  return normalizedAllowedRoles.includes(normalizedUserRole)
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Filter menu items based on user's role
  // Only show items that the current user is allowed to access
  const visibleMenuItems = menuItems.filter((item) => isRoleAllowed(user?.role, item.allowedRoles))

  const handleNavigation = (path: string) => {
    navigate(path)
    onMobileClose()
  }

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#1976d2', margin: 0 }}>ERP System</h1>
      </Box>

      {isAuthenticated && user && (
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#666' }}>
            <strong>{user.name}</strong>
          </p>
          <p style={{ margin: '0', fontSize: '0.75rem', color: '#999' }}>
            Role: <strong>{user.role}</strong>
          </p>
        </Box>
      )}

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {visibleMenuItems.length > 0 ? (
          visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive}
                  sx={{
                    backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                    color: isActive ? '#1976d2' : '#212121',
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                      borderRight: '4px solid #1976d2',
                    },
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          })
        ) : (
          <ListItem>
            <ListItemText primary="No modules available" />
          </ListItem>
        )}
      </List>

      <Divider />
      <Box sx={{ p: 2, textAlign: 'center', fontSize: '0.875rem', color: '#757575' }}>
        Version 1.0.0
      </Box>
    </Box>
  )

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
          },
          display: { xs: 'none', md: 'block' },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  )
}

export { DRAWER_WIDTH }
