#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { convert } = require('openapi-to-postmanv2');

const rootDir = path.resolve(__dirname, '..', '..');
const openapiPath = path.join(rootDir, 'docs', 'openapi.json');
const outputPath = path.join(rootDir, 'postman', 'ERP_Postman_Collection.json');

const publicPaths = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/signup',
  '/auth/verify-otp',
  '/auth/verify-email',
  '/auth/resend-otp',
  '/auth/logout'
]);

const ensureHeader = (headers, key, value) => {
  const existing = headers.find((h) => h.key.toLowerCase() === key.toLowerCase());
  if (!existing) {
    headers.push({ key, value });
  } else {
    existing.value = value;
  }
};

const getRawPath = (item) => {
  const url = item.request?.url;
  if (!url) return '';
  if (typeof url === 'string') return url;
  if (url.raw) return url.raw;
  if (Array.isArray(url.path)) return `/${url.path.join('/')}`;
  return '';
};

const normalizeUrl = (item) => {
  if (!item.request) return;
  const url = item.request.url;
  if (typeof url === 'string') {
    if (url.startsWith('http')) {
      const idx = url.indexOf('/api/');
      if (idx !== -1) {
        item.request.url = `{{baseUrl}}${url.slice(idx + 4)}`;
      }
    }
    return;
  }
  if (url && Array.isArray(url.path)) {
    const path = `/${url.path.join('/')}`;
    item.request.url = `{{baseUrl}}${path}`;
  }
};

const addAuthHeaderIfNeeded = (item) => {
  if (!item.request) return;
  const raw = getRawPath(item);
  const pathOnly = raw.includes('{{baseUrl}}') ? raw.replace('{{baseUrl}}', '') : raw;
  const isPublic = Array.from(publicPaths).some((p) => pathOnly.startsWith(`/api${p}`) || pathOnly.startsWith(p));

  if (!isPublic) {
    item.request.header = item.request.header || [];
    ensureHeader(item.request.header, 'Authorization', 'Bearer {{token}}');
  }
};

const addLoginTest = (item) => {
  if (!item.request) return;
  const raw = getRawPath(item);
  if (!raw.includes('/auth/login')) return;
  item.event = item.event || [];
  const scriptLines = [
    'const json = pm.response.json();',
    'if(json && (json.token || json.data?.token || json.data?.accessToken)) {',
    '  pm.environment.set(\"token\", json.token || json.data.token || json.data.accessToken);',
    '}'
  ];
  item.event.push({
    listen: 'test',
    script: { type: 'text/javascript', exec: scriptLines }
  });
};

const walkItems = (items) => {
  items.forEach((item) => {
    if (item.item) {
      if (item.name) {
        item.name = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      }
      walkItems(item.item);
      return;
    }
    normalizeUrl(item);
    addAuthHeaderIfNeeded(item);
    addLoginTest(item);
  });
};

const run = () => {
  if (!fs.existsSync(openapiPath)) {
    throw new Error(`OpenAPI spec not found at ${openapiPath}`);
  }

  const data = fs.readFileSync(openapiPath, 'utf8');
  convert(
    { type: 'string', data },
    { schemaFaker: true, indentCharacter: '  ' },
    (err, result) => {
      if (err || !result.result) {
        console.error('OpenAPI to Postman conversion failed', err || result);
        process.exit(1);
      }

      const collection = result.output[0].data;
      collection.info.name = 'ERP System API';

      walkItems(collection.item || []);

      const outDir = path.dirname(outputPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
      console.log(`Postman collection written to ${outputPath}`);
    }
  );
};

run();
