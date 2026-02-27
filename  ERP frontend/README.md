# ERP System - Enterprise Resource Planning Management

A modern, production-ready ERP (Enterprise Resource Planning) system built with React, Vite, Redux Toolkit, and Material UI.

## Features

- **Role-Based Access Control**: Admin, Manager, and User roles with different permission levels
- **Persistent Navigation**: Sidebar navigation with role-based menu visibility
- **Product Management**: Full CRUD operations with low-stock highlighting
- **Order Management**: Support for Purchase Orders, Sales Orders, and Goods Receipt Notes
- **Invoice Management**: Track and manage customer invoices
- **Dashboard**: Real-time metrics and revenue charts
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Professional UI**: Material UI with custom theme and styling
- **State Management**: Redux Toolkit for centralized state management
- **API Integration**: Axios with request/response interceptors for secure API calls

## Tech Stack

- **Frontend Framework**: React 18 + Vite
- **State Management**: Redux Toolkit
- **UI Library**: Material UI 5
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Data Visualization**: Recharts
- **Data Tables**: MUI X-Data-Grid
- **TypeScript**: Full TypeScript support

## Project Structure

```
src/
├── app/                 # Redux store configuration
├── components/          # Reusable UI components (Layout, Sidebar, TopBar)
├── features/            # Feature-specific Redux slices
│   ├── auth/           # Authentication
│   ├── products/       # Product management
│   ├── orders/         # Order management
│   └── dashboard/      # Dashboard metrics
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Customers.tsx
│   ├── Suppliers.tsx
│   ├── PurchaseOrders.tsx
│   ├── GRN.tsx
│   ├── SalesOrders.tsx
│   └── Invoices.tsx
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── styles/             # Global styles
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── main.tsx           # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd erp-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and set your API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

### Development

Start the development server:
```bash
pnpm dev
```

The application will open at `http://localhost:5173`

### Demo Credentials

For testing, use these credentials:

- **Admin**: username: `admin`, password: `password123`
- **User**: username: `user`, password: `password123`

## Building for Production

```bash
pnpm build
```

This generates optimized production files in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

## API Endpoints

The application expects the following API endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Products
- `GET /products` - Get all products
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Orders
- `GET /sales-orders` - Get all sales orders
- `GET /purchase-orders` - Get all purchase orders
- `GET /grn` - Get all goods receipt notes
- `GET /invoices` - Get all invoices

### Dashboard
- `GET /dashboard/metrics` - Get KPI metrics
- `GET /dashboard/chart` - Get revenue chart data

## Features Overview

### Dashboard
- Real-time KPI cards showing:
  - Total Sales
  - Pending Orders
  - Low Stock Alerts
  - Active Customers
- Monthly revenue bar chart

### Products Management
- View all products with pagination and sorting
- Search by product name or SKU
- Low-stock highlighting (red rows when stock ≤ reorder level)
- Add, edit, and delete products
- Batch operations support

### Authentication
- Secure login with username and password
- Role-based access control (RBAC)
- Automatic session management
- Logout with session cleanup
- 401/403 error handling with automatic redirect

### Navigation
- Persistent sidebar navigation
- Mobile-responsive collapsible sidebar
- Role-based menu visibility
- Active route highlighting

## State Management

### Redux Slices

#### Auth Slice
- `user`: Current user object
- `isAuthenticated`: Authentication status
- `loading`: Loading state
- `error`: Error message

#### Products Slice
- `items`: Array of products
- `loading`: Loading state
- `error`: Error message
- `filters`: Search and filter state

#### Orders Slice
- `salesOrders`: Sales orders list
- `purchaseOrders`: Purchase orders list
- `grns`: Goods receipt notes list
- `invoices`: Invoices list
- `loading`: Loading state
- `error`: Error message

#### Dashboard Slice
- `metrics`: KPI metrics
- `chartData`: Revenue chart data
- `loading`: Loading state
- `error`: Error message

## Responsive Design

- **Desktop**: Full layout with sidebar and main content
- **Tablet**: Collapsible sidebar on medium screens
- **Mobile**: Hamburger menu with drawer navigation

## Error Handling

- Centralized error handling via Axios interceptors
- Automatic logout on 401 (Unauthorized) responses
- User-friendly error messages displayed via alerts
- Loading states for all async operations

## Type Safety

Full TypeScript support with type definitions for:
- Redux state and actions
- API requests and responses
- Entity models (User, Product, Order, etc.)
- Component props

## Customization

### Theme Customization

Edit `src/main.tsx` to customize the Material UI theme:

```tsx
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    // ... more customizations
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // ... font sizes and weights
  },
})
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add a Redux slice in `src/features/` if needed
3. Add API service functions in `src/services/`
4. Add route in `src/App.tsx`
5. Add menu item in `src/components/Sidebar.tsx`

## Performance Optimization

- Lazy loading of routes (ready to implement)
- Code splitting via Vite's dynamic imports
- Memoization of components
- Redux selector memoization
- Recharts optimization for large datasets

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.

## Support

For issues, feature requests, or questions, please open an issue in the repository.

## Future Enhancements

- [ ] Advanced reporting and analytics
- [ ] Export to Excel/PDF functionality
- [ ] Real-time notifications
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Audit logs
- [ ] User management interface
- [ ] Email integration
