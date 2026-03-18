#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const swaggerSpec = require('../swagger');

const docsDir = path.resolve(__dirname, '..', '..', 'docs');
const outputPath = path.join(docsDir, 'openapi.json');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`OpenAPI spec written to ${outputPath}`);
