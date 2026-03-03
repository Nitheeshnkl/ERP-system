export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Sales' | 'Purchase' | 'Inventory'
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface Product {
  id: string
  name: string
  sku: string
  description: string
  price: number
  stock: number
  reorderLevel: number
  unit: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  orderDate: string
  expectedDeliveryDate: string
  status: 'draft' | 'pending' | 'received' | 'cancelled'
  items: PurchaseOrderItem[]
  totalAmount: number
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface GRN {
  id: string
  grnNumber: string
  purchaseOrderId: string
  receivedDate: string
  status: 'pending' | 'completed'
  items: GRNItem[]
}

export interface GRNItem {
  id: string
  productId: string
  quantityOrdered: number
  quantityReceived: number
  discrepancy: number
}

export interface SalesOrder {
  id: string
  soNumber: string
  customerId: string
  orderDate: string
  expectedDeliveryDate: string
  status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  items: SalesOrderItem[]
  totalAmount: number
}

export interface SalesOrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  salesOrderId: string
  customerId: string
  invoiceDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  items: InvoiceItem[]
  totalAmount: number
  taxAmount: number
  grandTotal: number
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface DashboardMetrics {
  totalSales: number
  pendingOrders: number
  lowStockAlerts: number
  activeCustomers: number
}

export interface ChartData {
  month: string
  revenue: number
}
