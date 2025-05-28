# 🚀 Quick Start Guide

## 📋 Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

## ⚡ 5-Minute Setup

### 1. Clone & Install
```bash
git clone <repo-url>
cd shopify-webhook-project
npm install
```

### 2. Environment Setup
```bash
# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopify_webhooks
DB_USER=postgres
DB_PASSWORD=your_password
SHOPIFY_WEBHOOK_SECRET=your_secret
EOF
```

### 3. Database Setup
```bash
# Create database
createdb shopify_webhooks

# Fix any database issues
npm run fix-db
```

### 4. Build & Start
```bash
npm run build
npm start
```

### 5. Test Everything
```bash
# In another terminal
node test-simple.js
```

## 🔗 Quick API Test

```bash
# Health check
curl http://localhost:3000/health

# Create product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Product","price":"19.99"}'

# Get all products
curl http://localhost:3000/products
```

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `src/index.ts` | Main server entry point |
| `src/controllers/product.controller.ts` | Product business logic |
| `src/routes/products.routes.ts` | Product API routes |
| `src/models/product.ts` | Product database model |
| `test-simple.js` | Quick API testing |

## 🛠️ Common Commands

```bash
# Development
npm run dev          # Hot reload development
npm run build        # Build TypeScript
npm start           # Start production server

# Testing
npm run test:api    # Full API test suite
node test-simple.js # Quick tests

# Database
npm run fix-db      # Fix database issues
npm run migrate     # Run migrations
```

## 🔧 Adding New Features

### 1. Add a New Model
```typescript
// src/models/newModel.ts
export const NewModel = sequelize.define("new_models", {
  // Define fields
});
```

### 2. Add Controller
```typescript
// src/controllers/newModel.controller.ts
export const createNewModel = async (req, res) => {
  // Business logic
};
```

### 3. Add Routes
```typescript
// src/routes/newModel.routes.ts
router.post("/", createNewModel);
```

### 4. Register Routes
```typescript
// src/index.ts
app.use("/new-models", newModelRoutes);
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check PostgreSQL is running and credentials in `.env` |
| Build errors | Run `npm install` and check TypeScript errors |
| Tests failing | Ensure server is running on port 3000 |
| Webhook verification fails | Check `SHOPIFY_WEBHOOK_SECRET` in `.env` |

## 📚 Next Steps

1. Read `PROJECT_OVERVIEW.md` for detailed analysis
2. Check `README.md` for comprehensive documentation
3. Explore the codebase starting with `src/index.ts`
4. Run the test suite to understand API behavior

**Happy coding! 🎉** 