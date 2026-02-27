#!/usr/bin/env node

/**
 * SEED SCRIPT - Creates initial user for testing
 *
 * USAGE:
 *   SEED_USER_EMAIL=<email> SEED_USER_PASSWORD=<password> npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || process.env.DB_URI;
    if (!dbUri) {
      throw new Error('MONGODB_URI or DB_URI is required');
    }
    await mongoose.connect(dbUri);
    console.log('MongoDB connected');
  } catch (connectError) {
    console.error('MongoDB connection failed:', connectError.message);
    process.exit(1);
  }
};

const seedUser = async () => {
  try {
    const email = process.env.SEED_USER_EMAIL;
    const password = process.env.SEED_USER_PASSWORD;
    const role = process.env.SEED_USER_ROLE || 'Admin';
    const name = process.env.SEED_USER_NAME || 'Seeded Admin';

    if (!email || !password) {
      throw new Error('SEED_USER_EMAIL and SEED_USER_PASSWORD are required');
    }

    console.log(`Seeding user with email: ${email}, role: ${role}`);

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists. Skipping seed.');
      return;
    }

    const newUser = new User({
      email: email.toLowerCase(),
      password,
      role,
      name
    });

    const savedUser = await newUser.save();
    console.log('User created successfully');
    console.log(`Email: ${savedUser.email}`);
    console.log(`Role: ${savedUser.role}`);
    console.log(`ID: ${savedUser._id}`);
  } catch (seedError) {
    if (seedError.code === 11000) {
      console.error('Email already exists in database');
    } else {
      console.error('Seed failed:', seedError.message);
    }
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await seedUser();
  await mongoose.disconnect();
  process.exit(0);
};

main();
