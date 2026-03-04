#!/usr/bin/env bash
set -euo pipefail

MONGO_URI="${MONGO_URI:-${MONGODB_URI:-}}"
SEED_ADMIN_EMAIL="${SEED_ADMIN_EMAIL:-}"
SEED_ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-}"
SEED_ADMIN_NAME="${SEED_ADMIN_NAME:-Production Admin}"
SEED_ADMIN_ROLE="${SEED_ADMIN_ROLE:-Admin}"

if [[ -z "$MONGO_URI" ]]; then
  echo "Missing required env: MONGO_URI (or MONGODB_URI)."
  exit 1
fi

if [[ -z "$SEED_ADMIN_EMAIL" ]]; then
  echo "Missing required env: SEED_ADMIN_EMAIL."
  exit 1
fi

GENERATED_PASSWORD="false"
if [[ -z "$SEED_ADMIN_PASSWORD" ]]; then
  if command -v openssl >/dev/null 2>&1; then
    SEED_ADMIN_PASSWORD="$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 20)"
  else
    SEED_ADMIN_PASSWORD="ChangeMe$(date +%s)"
  fi
  GENERATED_PASSWORD="true"
fi

export MONGO_URI SEED_ADMIN_EMAIL SEED_ADMIN_PASSWORD SEED_ADMIN_NAME SEED_ADMIN_ROLE GENERATED_PASSWORD

node <<'NODE'
const mongoose = require('./backend/node_modules/mongoose');
const User = require('./backend/src/models/User');

(async () => {
  const mongoUri = process.env.MONGO_URI;
  const email = process.env.SEED_ADMIN_EMAIL.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME;
  const role = process.env.SEED_ADMIN_ROLE;

  await mongoose.connect(mongoUri);

  const existing = await User.findOne({ email }).select('_id email role');
  if (existing) {
    console.log(`Admin user already exists for ${email}. No changes made.`);
    await mongoose.connection.close();
    return;
  }

  const user = new User({ name, email, password, role });
  await user.save();

  console.log(`Admin user created: ${email}`);
  console.log('Password (displayed once): ' + password);
  if (process.env.GENERATED_PASSWORD === 'true') {
    console.log('Note: password was generated automatically for this run.');
  }

  await mongoose.connection.close();
})();
NODE
