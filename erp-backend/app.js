require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { success, error } = require('./src/utils/response');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const purchaseOrderRoutes = require('./src/routes/purchaseOrderRoutes');
const grnRoutes = require('./src/routes/grnRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const salesOrderRoutes = require('./src/routes/salesOrderRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();
let server;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Public health endpoints for runtime probes
app.get('/health', (_req, res) => {
  return success(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, 'Health check passed');
});

app.get('/ready', (_req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (!isDbReady) {
    return error(res, 'Readiness check failed', 503, { db: 'disconnected' });
  }
  return success(res, {
    status: 'ready',
    db: 'connected',
  }, 'Readiness check completed');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/reports', reportRoutes);

// Keep as last middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Connect DB & Start Server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  const closeServer = server
    ? new Promise((resolve) => server.close(resolve))
    : Promise.resolve();

  closeServer
    .then(() => mongoose.connection.close())
    .then(() => process.exit(0))
    .catch((closeError) => {
      console.error('Error during shutdown:', closeError);
      process.exit(1);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
