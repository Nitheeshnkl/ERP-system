#!/usr/bin/env sh
set -e

if command -v newman >/dev/null 2>&1; then
  NEWMAN_CMD="newman"
else
  NEWMAN_CMD="npx newman"
fi

$NEWMAN_CMD run ERP_Postman_Collection.json -e ERP_Postman_Environment.json -r cli,json --reporter-json-export newman-report.json
