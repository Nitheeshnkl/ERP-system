#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI (or MONGODB_URI / DB_URI) is not set');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');

  const email = 'admin@example.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists');
    await mongoose.disconnect();
    process.exit(0);
  }

  await User.create({
    name: 'Admin User',
    email,
    password: 'password123',
    role: 'Admin',
    isVerified: true,
    emailVerified: true
  });

  console.log('Admin user created');
  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch(async (error) => {
  console.error('Admin seed failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('MongoDB disconnect failed:', disconnectError.message);
  }
  process.exit(1);
});
