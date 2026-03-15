#!/usr/bin/env node

const email = process.env.TEST_EMAIL || 'nithee2812@gmail.com';
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:8000';

async function main() {
  const payload = {
    name: 'OTP Test User',
    email,
    password: 'Test12345',
  };

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let body;
  try {
    body = await res.json();
  } catch (_err) {
    body = await res.text();
  }

  console.log(JSON.stringify({ status: res.status, body }, null, 2));
}

main().catch((err) => {
  console.error('OTP debug test failed:', err.message);
  process.exit(1);
});
