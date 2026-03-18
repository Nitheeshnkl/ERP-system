# ERP Postman Collection Guide

## Importing
1. Open Postman.
2. Click **Import**.
3. Choose `postman/ERP_Postman_Collection.json` and `postman/ERP_Postman_Environment.json`.

## Select Environment
1. In the top-right environment picker, choose **ERP Local**.

## Authenticate
1. Open **Auth → POST /api/auth/login**.
2. Click **Send**.
3. The test script stores the JWT into `{{token}}`.

## Running The Collection
- Postman Collection Runner: select the collection and click **Run**.
- Newman (CLI):
  - Global install: `npm i -g newman`
  - Run: `newman run postman/ERP_Postman_Collection.json -e postman/ERP_Postman_Environment.json -r cli,json --reporter-json-export postman/newman-report.json`
  - Or use `npx newman run postman/ERP_Postman_Collection.json -e postman/ERP_Postman_Environment.json -r cli,json --reporter-json-export postman/newman-report.json`

## Export Results
1. In Postman Runner, click **Export Results** for a JSON report.
2. Zip `postman/ERP_Postman_Collection.json` + `postman/ERP_Postman_Environment.json` + any run report for sharing.

## Troubleshooting
- Server not running: start the backend and confirm the port.
- Wrong baseUrl: update `baseUrl` in the environment.
- Missing token: re-run the Login request or ensure it succeeded.

## Notes
- Collection format: Postman v2.1.
- Compatible with Postman v9+ and Newman.
