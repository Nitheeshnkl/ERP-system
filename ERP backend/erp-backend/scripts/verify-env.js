#!/usr/bin/env node

require('dotenv').config();

const value = (key) => (process.env[key] || '').trim();

const missing = [];

if (!value('JWT_SECRET')) {
  missing.push('JWT_SECRET');
}

if (!value('MONGODB_URI') && !value('DB_URI') && !value('MONGO_URI')) {
  missing.push('MONGODB_URI (or DB_URI / MONGO_URI)');
}

if (!value('CLIENT_URL') && !value('CLIENT_URLS')) {
  missing.push('CLIENT_URL (or CLIENT_URLS)');
}

if (value('ENABLE_DEMO_SEEDING') === 'true') {
  if (!value('DEMO_ADMIN_EMAIL')) missing.push('DEMO_ADMIN_EMAIL (required when ENABLE_DEMO_SEEDING=true)');
  if (!value('DEMO_ADMIN_PASSWORD')) missing.push('DEMO_ADMIN_PASSWORD (required when ENABLE_DEMO_SEEDING=true)');
}

if (missing.length > 0) {
  console.error('Environment verification failed. Missing required variables:');
  missing.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Environment verification passed.');
