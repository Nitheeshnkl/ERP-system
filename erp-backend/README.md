# ERP Backend

This is the standalone backend for the ERP frontend. Built with Node.js, Express, and MongoDB.

## Replit Run Instructions
1. Open the Secrets panel on Replit.
2. Add the following secrets:
   - `MONGODB_URI`: Your MongoDB connection string (Atlas or local).
   - `JWT_SECRET`: A secure random string for signing JWTs.
   - `CLIENT_URL`: The URL of your frontend (e.g., `http://localhost:5173`).
3. Open the Shell and run:
   ```bash
   cd erp-backend
   npm install
   npm run dev
   ```

## Running Tests
In the Shell:
```bash
cd erp-backend
npm test
```

## GitHub Push Instructions
1. Commit your changes: `git add . && git commit -m "ERP Backend"`
2. Add your GitHub remote: `git remote add origin <your-repo-url>`
3. Push: `git push -u origin main`

## Deployment to Render / Vercel
- **Render**: Connect your GitHub repo, select "Web Service", set Build Command to `npm install` and Start Command to `npm start`. Add environment variables in the Render dashboard.
- **Vercel**: Not recommended for long-running Express apps, but can be done using serverless functions if wrapped appropriately. Alternatively, deploy as a Docker container using a VPS or service like Railway/Fly.io.
