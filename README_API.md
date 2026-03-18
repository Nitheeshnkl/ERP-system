# ERP Backend API Guide

## Run The Backend
1. `cd ERP-system/backend`
2. Create `.env` with `MONGO_URI` and `JWT_SECRET`.
3. Install dependencies: `npm install`
4. Start server: `npm run dev` (or `npm start`)

## Seed Admin User
1. `cd ERP-system/backend`
2. Run: `npm run seed:admin`
3. Login with:
   - Email: `admin@example.com`
   - Password: `password123`

## Test APIs
1. Open `http://localhost:5000/api-docs` for Swagger UI.
2. Open `http://localhost:5000/docs/openapi.json` for the OpenAPI spec.

## Generate OpenAPI and Postman
1. `cd ERP-system/backend`
2. Generate OpenAPI: `npm run generate:openapi`
3. Generate Postman collection: `npm run generate:postman`

## Run Postman/Newman
1. Import `postman/ERP_Postman_Collection.json` and `postman/ERP_Postman_Environment.json` into Postman.
2. Run **Auth → POST /api/auth/login** to populate `{{token}}`.
3. Run the collection or:
4. `cd ERP-system/postman`
5. `npm i -g newman` (or `npx newman -v`)
6. `./newman-run.sh`

## Common Issues
- 401 Unauthorized: run the Login request to set `{{token}}`.
- 403 Forbidden: ensure you are using an Admin user for Admin-only endpoints.
- 500 errors: verify DB connection and required env vars.
