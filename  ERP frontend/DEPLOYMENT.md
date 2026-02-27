# Deployment Guide - ERP System

This guide provides instructions for deploying the ERP System to various platforms.

## Prerequisites

- Node.js 16+ installed
- Git configured
- Vercel account (for Vercel deployment)
- or similar hosting provider

## Environment Configuration

### 1. Create Production Environment File

Create a `.env.production` file in the root directory:

```env
VITE_API_BASE_URL=https://api.yourcompany.com
VITE_APP_NAME=ERP System
VITE_APP_VERSION=1.0.0
```

Replace `https://api.yourcompany.com` with your actual API endpoint.

## Building for Production

### Local Build

```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Preview the production build locally
pnpm preview
```

The optimized production files will be in the `dist/` directory.

## Deployment Options

### Option 1: Vercel (Recommended)

**Advantages**: Zero-configuration, automatic deployments, great DX

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

3. **Set Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add `VITE_API_BASE_URL` pointing to your API

4. **Custom Domain (Optional)**
   - Domain settings → Add custom domain
   - Update DNS records as instructed

### Option 2: Docker

**Create a Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build and run:**

```bash
docker build -t erp-system .
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=https://api.yourcompany.com \
  erp-system
```

### Option 3: AWS S3 + CloudFront

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Create S3 bucket**
   - AWS Console → S3 → Create bucket
   - Enable static website hosting
   - Upload contents of `dist/` folder

3. **Setup CloudFront**
   - AWS Console → CloudFront → Create distribution
   - Set S3 bucket as origin
   - Configure default root object: `index.html`
   - Add error page handler (404 → index.html)

4. **Update API endpoints**
   - Use AWS Systems Manager Parameter Store or Lambda@Edge to inject API base URL

### Option 4: Nginx (Self-hosted)

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Nginx Configuration**

Create `/etc/nginx/sites-available/erp-system`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/erp-system;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    
    # Cache busting for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing - fallback to index.html
    location / {
        try_files $uri /index.html;
    }
    
    # API proxy (optional)
    location /api {
        proxy_pass http://api.yourcompany.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Enable and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/erp-system /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Post-Deployment Checklist

- [ ] Verify environment variables are correctly set
- [ ] Test login functionality
- [ ] Test API connectivity (check network tab in DevTools)
- [ ] Test main features (Products, Orders, Dashboard)
- [ ] Verify responsive design on mobile
- [ ] Check browser console for errors
- [ ] Verify CORS is configured correctly
- [ ] Test error handling (401, 403 responses)
- [ ] Setup monitoring and error tracking
- [ ] Configure auto-backups if applicable

## Performance Optimization

### Already Configured

- Vite's automatic code splitting
- Rollup bundle optimization in `vite.config.ts`
- CSS minification
- JavaScript minification
- Tree shaking

### Additional Recommendations

1. **Enable HTTP/2 Push**
   ```nginx
   http2_push_preload on;
   ```

2. **Add Security Headers**
   ```nginx
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header Referrer-Policy "strict-origin-when-cross-origin" always;
   ```

3. **Setup CDN for Static Assets**
   - Use CloudFront, Cloudflare, or similar
   - Configure origin to S3 or your server
   - Set cache headers appropriately

4. **Monitoring**
   - Use Sentry for error tracking
   - Use Google Analytics or similar for user tracking
   - Monitor API response times

## Troubleshooting

### Blank Page After Deploy

1. Check browser console for errors
2. Verify `VITE_API_BASE_URL` environment variable
3. Ensure `index.html` is being served on 404 (SPA routing)
4. Clear browser cache and rebuild

### API Connection Issues

1. Verify API base URL in environment
2. Check CORS configuration on API server
3. Verify credentials (cookies) are being sent
4. Check network tab for request/response details

### Build Failures

1. Clear `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
2. Verify all dependencies are installed
3. Check TypeScript errors: `pnpm type-check`
4. Review build logs for specific errors

## Rollback Procedure

### Vercel
- Go to Deployments
- Select the previous successful deployment
- Click "Redeploy"

### Docker
- Push and tag previous working version
- Deploy that image instead

### Manual/S3
- Keep backup of previous `dist/` folder
- Re-upload to hosting

## Scheduled Maintenance

1. Keep dependencies updated
   ```bash
   pnpm update
   ```

2. Monitor bundle size
   ```bash
   pnpm build && ls -lh dist/
   ```

3. Review security advisories
   ```bash
   pnpm audit
   ```

## Support

For deployment issues, refer to platform-specific documentation:
- [Vercel Docs](https://vercel.com/docs)
- [Docker Docs](https://docs.docker.com/)
- [AWS Docs](https://docs.aws.amazon.com/)
- [Nginx Docs](https://nginx.org/en/docs/)
