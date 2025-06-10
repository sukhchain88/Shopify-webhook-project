# 🚀 Deployment Guide - Render.com

This guide provides step-by-step instructions for deploying the Shopify Webhook Handler to Render.com.

## 📋 Prerequisites

- GitHub repository with your code
- Render.com account
- PostgreSQL database (can be created on Render)
- Redis instance (can be created on Render)

## 🔧 Pre-Deployment Checklist

### 1. TypeScript Configuration
Ensure your `tsconfig.json` is correctly configured:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

**⚠️ Important**: Do NOT include these properties:
- `"noEmit": true` - This prevents JavaScript compilation
- `"allowImportingTsExtensions": true` - Conflicts with ES modules

### 2. Package.json Configuration
Verify your `package.json` has:

```json
{
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 3. Import Statements
All relative imports must use `.js` extensions:

```typescript
// ✅ Correct
import { Product } from "../models/Product.js";
import sequelize from "./db.js";

// ❌ Incorrect
import { Product } from "../models/Product";
import sequelize from "./db";
```

## 🗄️ Database Setup on Render

### 1. Create PostgreSQL Database

1. Go to Render Dashboard → New → PostgreSQL
2. Configure:
   - **Name**: `shopify-webhook-db`
   - **Database**: `shopify_webhook_db`
   - **User**: `shopify_user` (or use default)
   - **Region**: Choose closest to your web service
3. Click "Create Database"
4. Note the connection details from the dashboard

### 2. Create Redis Instance

1. Go to Render Dashboard → New → Redis
2. Configure:
   - **Name**: `shopify-webhook-redis`
   - **Region**: Same as your database
3. Click "Create Redis"
4. Note the Redis URL from the dashboard

## 🚀 Web Service Deployment

### 1. Create Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `shopify-webhook-handler`
   - **Region**: Same as your database
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2. Environment Variables

Add these environment variables in the Render dashboard:

#### Required Variables
```bash
NODE_ENV=production
PORT=10000

# Shopify Configuration
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_key

# Database (from Render PostgreSQL)
DB_HOST=your-postgres-host.render.com
DB_PORT=5432
DB_NAME=shopify_webhook_db
DB_USER=shopify_user
DB_PASSWORD=your-generated-password

# Redis (from Render Redis)
REDIS_URL=redis://your-redis-url.render.com:6379

# Webhook Configuration
WEBHOOK_BASE_URL=https://your-app-name.onrender.com
WEBHOOK_VERIFY_SIGNATURE=true

# Security
ALLOWED_ORIGINS=https://your-frontend.com,https://admin.shopify.com
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

#### Optional Variables
```bash
# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false

# Features
ENABLE_BACKGROUND_JOBS=true
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_WEBHOOK_RETRY=true

# Development Only (set to false in production)
ENABLE_DB_LOGGING=false
ENABLE_DB_SYNC=false
SEED_DATABASE=false
```

### 3. Advanced Settings

In the Render dashboard, configure:

- **Auto-Deploy**: Enable for automatic deployments
- **Health Check Path**: `/health`
- **Disk**: 1GB (minimum)
- **Instance Type**: Starter (can upgrade later)

## 🔗 Shopify Webhook Configuration

After deployment, configure Shopify webhooks:

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Add webhook endpoints:

```
https://your-app-name.onrender.com/api/webhooks/shopify/orders/create
https://your-app-name.onrender.com/api/webhooks/shopify/orders/updated
https://your-app-name.onrender.com/api/webhooks/shopify/products/create
https://your-app-name.onrender.com/api/webhooks/shopify/products/update
https://your-app-name.onrender.com/api/webhooks/shopify/customers/create
```

3. Set the webhook secret in your environment variables

## 🧪 Testing Deployment

### 1. Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{
  "uptime": 123.456,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

### 2. API Endpoints
```bash
# Test products endpoint
curl https://your-app-name.onrender.com/products

# Test API root
curl https://your-app-name.onrender.com/
```

### 3. Webhook Testing
Use Shopify's webhook testing tool or:
```bash
curl -X POST https://your-app-name.onrender.com/api/webhooks/shopify/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. Module Resolution Errors
```
error TS2307: Cannot find module '../models/Product.js'
```

**Solution**: 
- Check all imports use `.js` extensions
- Verify `tsconfig.json` doesn't have `noEmit: true`
- Ensure `"type": "module"` is in `package.json`

#### 2. Build Failures
```
npm ERR! Build failed
```

**Solution**:
- Check build logs in Render dashboard
- Verify `npm run build` works locally
- Ensure all dependencies are in `package.json`

#### 3. Database Connection Issues
```
Connection error: database "shopify_webhook_db" does not exist
```

**Solution**:
- Verify database environment variables
- Check PostgreSQL instance is running
- Test connection string format

#### 4. Redis Connection Issues
```
Redis connection failed
```

**Solution**:
- Verify `REDIS_URL` environment variable
- Check Redis instance is running
- Ensure Redis URL format is correct

### Debugging Steps

1. **Check Render Logs**:
   - Go to Render Dashboard → Your Service → Logs
   - Look for startup errors and warnings

2. **Verify Environment Variables**:
   - Check all required variables are set
   - Verify no typos in variable names

3. **Test Locally**:
   - Ensure `npm run build` succeeds
   - Test `npm start` with production-like env vars

4. **Database Connectivity**:
   - Use a database client to test connection
   - Verify database permissions

## 🔄 CI/CD Pipeline

### Automatic Deployments

Render automatically deploys when you push to your configured branch. To set up a proper CI/CD pipeline:

1. **GitHub Actions** (optional):
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm test
```

2. **Pre-deployment Testing**:
   - Run tests locally before pushing
   - Use staging environment for testing

## 📊 Monitoring

### Health Monitoring
- Set up monitoring for `/health` endpoint
- Configure alerts for downtime
- Monitor response times and error rates

### Database Monitoring
- Monitor database connections
- Set up alerts for connection pool exhaustion
- Track query performance

### Application Monitoring
- Monitor webhook processing rates
- Track API response times
- Set up error tracking (Sentry, etc.)

## 🔐 Security Considerations

### Production Security
- Use strong passwords for database
- Rotate Shopify access tokens regularly
- Monitor for suspicious webhook activity
- Enable HTTPS only (Render provides this automatically)

### Environment Variables
- Never commit secrets to Git
- Use Render's environment variable encryption
- Regularly audit environment variables

## 📈 Scaling

### Performance Optimization
- Monitor instance CPU and memory usage
- Upgrade instance type if needed
- Consider database connection pooling adjustments

### Load Testing
- Test webhook processing under load
- Monitor database performance
- Verify rate limiting effectiveness

---

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review Render documentation
3. Check application logs
4. Verify Shopify webhook configuration

Remember: Most deployment issues are related to environment variables or TypeScript configuration! 🎯 