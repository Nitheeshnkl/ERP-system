#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');
const Supplier = require('../src/models/Supplier');
const SalesOrder = require('../src/models/SalesOrder');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const GRN = require('../src/models/GRN');
const Invoice = require('../src/models/Invoice');

dotenv.config();

const userSeedData = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'Admin',
    isVerified: true,
    emailVerified: true
  },
  {
    name: 'Sales Manager',
    email: 'sales.manager@erp.local',
    password: 'Sales123',
    role: 'Sales',
    isVerified: true,
    emailVerified: true
  },
  {
    name: 'Purchase Manager',
    email: 'purchase.manager@erp.local',
    password: 'Purchase123',
    role: 'Purchase',
    isVerified: true,
    emailVerified: true
  },
  {
    name: 'Inventory Manager',
    email: 'inventory.manager@erp.local',
    password: 'Inventory123',
    role: 'Inventory',
    isVerified: true,
    emailVerified: true
  }
];

const productSeedData = [
  { name: 'Laptop Model A', sku: 'PRD-LAP-A', price: 60000, stockQuantity: 50 },
  { name: 'Laptop Model B', sku: 'PRD-LAP-B', price: 72000, stockQuantity: 35 },
  { name: 'Desktop Workstation X', sku: 'PRD-DESK-X', price: 85000, stockQuantity: 22 },
  { name: 'Monitor 24 Inch', sku: 'PRD-MON-24', price: 12500, stockQuantity: 90 },
  { name: 'Monitor 27 Inch', sku: 'PRD-MON-27', price: 18500, stockQuantity: 75 },
  { name: 'Mechanical Keyboard Pro', sku: 'PRD-KB-PRO', price: 4500, stockQuantity: 180 },
  { name: 'Wireless Mouse Plus', sku: 'PRD-MSE-WL', price: 2200, stockQuantity: 240 },
  { name: 'USB-C Docking Station', sku: 'PRD-DOCK-C', price: 9800, stockQuantity: 60 },
  { name: '1TB NVMe SSD', sku: 'PRD-SSD-1TB', price: 8900, stockQuantity: 110 },
  { name: '2TB External HDD', sku: 'PRD-HDD-2TB', price: 6700, stockQuantity: 130 },
  { name: 'Enterprise Router R1', sku: 'PRD-ROUT-R1', price: 23000, stockQuantity: 28 },
  { name: 'Managed Switch 24 Port', sku: 'PRD-SWT-24', price: 19500, stockQuantity: 40 },
  { name: 'VoIP Phone V200', sku: 'PRD-VOIP-200', price: 7500, stockQuantity: 95 },
  { name: 'Office Chair Ergo', sku: 'PRD-CHR-ERG', price: 12500, stockQuantity: 70 },
  { name: 'Height Adjustable Desk', sku: 'PRD-DSK-ADJ', price: 28000, stockQuantity: 32 },
  { name: 'Projector Business 4K', sku: 'PRD-PRJ-4K', price: 92000, stockQuantity: 12 },
  { name: 'Conference Camera C100', sku: 'PRD-CAM-C100', price: 34000, stockQuantity: 20 },
  { name: 'Network Firewall F50', sku: 'PRD-FW-F50', price: 115000, stockQuantity: 10 },
  { name: 'Barcode Scanner BS10', sku: 'PRD-BAR-BS10', price: 5900, stockQuantity: 85 },
  { name: 'Thermal Printer TP80', sku: 'PRD-PRN-TP80', price: 16800, stockQuantity: 45 }
];

const customerSeedData = [
  { name: 'ABC Technologies Pvt Ltd', email: 'contact@abctech.com', phone: '9876543210', address: 'Chennai, India' },
  { name: 'Nexus Retail Solutions', email: 'procurement@nexusretail.com', phone: '9876543211', address: 'Bengaluru, India' },
  { name: 'Vertex Health Systems', email: 'ops@vertexhealth.com', phone: '9876543212', address: 'Hyderabad, India' },
  { name: 'BluePeak Logistics', email: 'it@bluepeaklogistics.com', phone: '9876543213', address: 'Mumbai, India' },
  { name: 'Aster Manufacturing Co', email: 'purchase@astermfg.com', phone: '9876543214', address: 'Pune, India' },
  { name: 'GreenField Foods Ltd', email: 'admin@greenfieldfoods.com', phone: '9876543215', address: 'Coimbatore, India' },
  { name: 'Skyline Education Group', email: 'infrastructure@skylineedu.com', phone: '9876543216', address: 'Delhi, India' },
  { name: 'Orion FinServe', email: 'facilities@orionfinserve.com', phone: '9876543217', address: 'Kolkata, India' },
  { name: 'Trident Hospitality', email: 'hq@tridenthospitality.com', phone: '9876543218', address: 'Goa, India' },
  { name: 'Quantum Automotive', email: 'stores@quantumauto.com', phone: '9876543219', address: 'Ahmedabad, India' }
];

const supplierSeedData = [
  {
    name: 'Global Electronics Supply',
    email: 'supply@global.com',
    phone: '9988776655',
    address: 'M.G. Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560001'
  },
  {
    name: 'Prime Components India',
    email: 'sales@primecomponents.in',
    phone: '9988776656',
    address: 'Industrial Estate Phase 2',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '600058'
  },
  {
    name: 'NextGen Office Essentials',
    email: 'support@nextgenoffice.com',
    phone: '9988776657',
    address: 'Tech Park Road',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    postalCode: '500081'
  },
  {
    name: 'SecureNet Infra Distributors',
    email: 'orders@securenetinfra.com',
    phone: '9988776658',
    address: 'Sector 18',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    postalCode: '201301'
  },
  {
    name: 'Unified Industrial Traders',
    email: 'contact@unifiedtraders.com',
    phone: '9988776659',
    address: 'Market Yard',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '411037'
  }
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandomProducts = (products, count) => {
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const createSalesOrders = (customers, products, count) => {
  const orders = [];
  for (let i = 0; i < count; i += 1) {
    const customer = customers[i % customers.length];
    const productCount = randomInt(1, 3);
    const selectedProducts = pickRandomProducts(products, productCount);
    const items = selectedProducts.map((product) => {
      const quantity = randomInt(1, 8);
      return {
        productId: product._id,
        productName: product.name,
        quantity,
        unitPrice: product.price
      };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const statusOptions = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    orders.push({
      customerId: customer._id,
      customerName: customer.name,
      items,
      totalAmount,
      status: statusOptions[i % statusOptions.length]
    });
  }
  return orders;
};

const createPurchaseOrders = (suppliers, products, count) => {
  const orders = [];
  for (let i = 0; i < count; i += 1) {
    const supplier = suppliers[i % suppliers.length];
    const productCount = randomInt(1, 3);
    const selectedProducts = pickRandomProducts(products, productCount);
    const items = selectedProducts.map((product) => {
      const quantity = randomInt(10, 40);
      const unitPrice = Math.max(1, Math.floor(product.price * 0.72));
      return {
        productId: product._id,
        productName: product.name,
        quantity,
        unitPrice
      };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const statusOptions = ['Pending', 'Received', 'Cancelled'];
    orders.push({
      supplierId: supplier._id,
      supplierName: supplier.name,
      items,
      totalAmount,
      status: statusOptions[i % statusOptions.length]
    });
  }
  return orders;
};

const createGrns = (purchaseOrders, count) => {
  const grns = [];
  const sourceOrders = purchaseOrders.slice(0, count);
  sourceOrders.forEach((purchaseOrder) => {
    const items = purchaseOrder.items.map((item) => ({
      productId: item.productId,
      receivedQuantity: item.quantity
    }));
    grns.push({
      purchaseOrderId: purchaseOrder._id,
      items
    });
  });
  return grns;
};

const createInvoices = (salesOrders, count) => {
  const invoices = [];
  const sourceOrders = salesOrders.slice(0, count);
  sourceOrders.forEach((salesOrder, index) => {
    const paymentStatusOptions = ['Paid', 'Pending', 'Cancelled'];
    invoices.push({
      salesOrderId: salesOrder._id,
      amount: salesOrder.totalAmount,
      pdfPath: `invoices/INV-${String(index + 1).padStart(4, '0')}.pdf`,
      paymentStatus: paymentStatusOptions[index % paymentStatusOptions.length]
    });
  });
  return invoices;
};

const seedDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  await User.deleteMany({});
  await Product.deleteMany({});
  await Customer.deleteMany({});
  await Supplier.deleteMany({});
  await SalesOrder.deleteMany({});
  await PurchaseOrder.deleteMany({});
  await GRN.deleteMany({});
  await Invoice.deleteMany({});
  console.log('Existing data cleared');

  const users = await User.insertMany(userSeedData);
  console.log(`Users seeded (${users.length})`);

  const products = await Product.insertMany(productSeedData);
  console.log(`Products seeded (${products.length})`);

  const customers = await Customer.insertMany(customerSeedData);
  console.log(`Customers seeded (${customers.length})`);

  const suppliers = await Supplier.insertMany(supplierSeedData);
  console.log(`Suppliers seeded (${suppliers.length})`);

  const salesOrders = await SalesOrder.insertMany(createSalesOrders(customers, products, 15));
  console.log(`Sales Orders seeded (${salesOrders.length})`);

  const purchaseOrders = await PurchaseOrder.insertMany(createPurchaseOrders(suppliers, products, 10));
  console.log(`Purchase Orders seeded (${purchaseOrders.length})`);

  const grns = await GRN.insertMany(createGrns(purchaseOrders, 10));
  console.log(`GRN seeded (${grns.length})`);

  const invoices = await Invoice.insertMany(createInvoices(salesOrders, 10));
  console.log(`Invoices seeded (${invoices.length})`);

  await mongoose.disconnect();
  console.log('Database seeding completed');
  process.exit();
};

seedDatabase().catch(async (error) => {
  console.error('Database seeding failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('MongoDB disconnect failed:', disconnectError.message);
  }
  process.exit(1);
});
