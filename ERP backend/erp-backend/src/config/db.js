const mongoose = require('mongoose');
const User = require('../models/User');
const DemoMetadata = require('../models/DemoMetadata');
const Supplier = require('../models/Supplier');

const getDemoAdminFromEnv = () => ({
  email: process.env.DEMO_ADMIN_EMAIL,
  password: process.env.DEMO_ADMIN_PASSWORD,
  name: process.env.DEMO_ADMIN_NAME || 'Demo Admin',
  role: process.env.DEMO_ADMIN_ROLE || 'Admin'
});

const shouldSeedDemoCredentials = () => process.env.ENABLE_DEMO_SEEDING === 'true';

const seedDemoAdmin = async () => {
  const demoAdmin = getDemoAdminFromEnv();

  if (!demoAdmin.email || !demoAdmin.password) {
    console.warn('Demo seeding enabled but DEMO_ADMIN_EMAIL/DEMO_ADMIN_PASSWORD not configured. Skipping demo admin seed.');
    return;
  }

  try {
    const normalizedEmail = demoAdmin.email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (!existingUser) {
      await User.create({
        ...demoAdmin,
        email: normalizedEmail
      });
      console.log(`Demo Admin account created: ${normalizedEmail}`);
    } else {
      existingUser.name = demoAdmin.name;
      existingUser.role = demoAdmin.role;
      existingUser.email = normalizedEmail;
      existingUser.password = demoAdmin.password;
      await existingUser.save();
      console.log(`Demo Admin account reset: ${normalizedEmail}`);
    }
  } catch (seedError) {
    console.error('Error seeding demo admin:', seedError.message);
  }
};

const seedDemoMetadata = async () => {
  const demoAdmin = getDemoAdminFromEnv();
  if (!demoAdmin.email) {
    return;
  }

  const demoMetadata = {
    type: 'demo_credentials',
    role: demoAdmin.role,
    email: demoAdmin.email.toLowerCase(),
    note: 'Demo account metadata only; no password values are persisted'
  };

  try {
    const existingMeta = await DemoMetadata.findOne({ type: 'demo_credentials' });

    if (!existingMeta) {
      await DemoMetadata.create(demoMetadata);
      console.log('Demo metadata created in erp_db.demo_metadata collection');
    } else {
      await DemoMetadata.updateOne({ type: 'demo_credentials' }, demoMetadata);
      console.log('Demo metadata updated in erp_db.demo_metadata collection');
    }
  } catch (seedError) {
    console.error('Error seeding demo metadata:', seedError.message);
  }
};

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.DB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp';
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    if (shouldSeedDemoCredentials()) {
      await seedDemoAdmin();
      await seedDemoMetadata();
    } else {
      console.log('Demo credential seeding disabled');
    }

    try {
      const supplierIndexes = await Supplier.collection.indexes();
      const legacyEmailIndex = supplierIndexes.find((idx) => idx.name === 'email_1');
      const isLegacyEmailIndex = legacyEmailIndex && !legacyEmailIndex.partialFilterExpression;
      if (isLegacyEmailIndex) {
        await Supplier.collection.dropIndex('email_1');
        console.log('Dropped legacy suppliers.email_1 unique index');
      }
      await Supplier.syncIndexes();
    } catch (indexError) {
      console.error('Supplier index sync warning:', indexError.message);
    }

    return conn;
  } catch (connectError) {
    console.error(`MongoDB connection error: ${connectError.message}`);
    throw connectError;
  }
};

module.exports = connectDB;
