require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { success, error } = require('./src/utils/response');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');
const { apiRateLimiter } = require('./src/middleware/rateLimit');

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
let isShuttingDown = false;

const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || '';
const allowedOrigins = rawOrigins === '*'
  ? '*'
  : rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

const validateEnv = () => {
  const missing = [];
  const hasMongoUri = Boolean(
    (process.env.MONGODB_URI || '').trim() ||
    (process.env.DB_URI || '').trim() ||
    (process.env.MONGO_URI || '').trim()
  );

  if (!hasMongoUri) {
    missing.push('MONGODB_URI (or DB_URI / MONGO_URI)');
  }

  if (!(process.env.JWT_SECRET || '').trim()) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
};

// Middleware
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Allow all (only if explicitly set)
      if (allowedOrigins === '*') {
        return callback(null, true);
      }

      // Allow listed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Block everything else
      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

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
app.use('/api', apiRateLimiter);
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

const PORT = Number(process.env.PORT) || 8000;
const startServer = async () => {
  try {
    validateEnv();
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`ERP backend listening on http://localhost:${PORT}`);
    });

    server.on('error', (listenError) => {
      if (listenError.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing process or set a different PORT.`);
      } else {
        console.error('Server startup error:', listenError.message);
      }
      process.exit(1);
    });

    if (process.env.ENABLE_SOCKET_IO === 'true') {
      try {
        const { initSocket } = require('./src/socket');
        initSocket(server);
        console.log('Socket.io scaffold enabled');
      } catch (socketError) {
        console.error('Socket.io scaffold failed to initialize:', socketError.message);
      }
    } else {
      console.log('Socket.io scaffold disabled');
    }
  } catch (startupError) {
    console.error('Startup failed:', startupError.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(0);
  } catch (closeError) {
    console.error('Error during shutdown:', closeError.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
