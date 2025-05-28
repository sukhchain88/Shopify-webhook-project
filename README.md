# 🚀 Shopify Webhook Handler Project

A comprehensive Node.js application for handling Shopify webhooks and managing products with a clean, well-structured codebase.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Development](#development)
- [Database](#database)
- [Deployment](#deployment)

## ✨ Features

- **Shopify Webhook Processing**: Secure webhook verification and processing
- **Product Management**: Full CRUD operations for products
- **Database Integration**: PostgreSQL with Sequelize ORM
- **Type Safety**: Written in TypeScript with proper type definitions
- **Error Handling**: Comprehensive error handling and logging
- **API Testing**: Built-in test suite for all endpoints
- **Pagination**: Support for paginated product listings
- **Search & Filtering**: Product search and status filtering
- **Health Monitoring**: Health check endpoint for monitoring

## 📁 Project Structure

```
shopify-webhook-project/
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.ts         # Database connection
│   │   └── config.ts     # App configuration
│   ├── controllers/      # Request handlers
│   │   ├── product.controller.ts
│   │   ├── webhook.controller.ts
│   │   └── ...
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── requestTiming.ts
│   │   └── verifyShopifyWebhook.ts
│   ├── models/          # Database models
│   │   ├── product.ts
│   │   ├── webhook.ts
│   │   └── ...
│   ├── routes/          # API routes
│   │   ├── products.routes.ts
│   │   ├── webhook.routes.ts
│   │   └── ...
│   ├── services/        # Business logic
│   │   ├── product.service.ts
│   │   └── ...
│   ├── validators/      # Input validation
│   │   ├── product.validator.ts
│   │   └── ...
│   ├── utils/          # Utility functions
│   └── index.ts        # Main application entry
├── tests/              # Test files
│   └── api-tests.js    # Comprehensive API tests
├── scripts/            # Database scripts
├── migrations/         # Database migrations
├── dist/              # Compiled JavaScript
└── docs/              # Documentation
```

## 🛠 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopify-webhook-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb shopify_webhooks
   
   # Run migrations (if any)
   npm run migrate
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   npm start
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopify_webhooks
DB_USER=postgres
DB_PASSWORD=your_password

# Shopify Configuration
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🔌 API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Products
- **GET** `/products` - Get all products (with pagination)
  - Query params: `page`, `limit`, `search`, `status`
- **GET** `/products/:id` - Get product by ID
- **POST** `/products` - Create new product
- **PUT** `/products/:id` - Update product
- **DELETE** `/products/:id` - Delete product

### Webhooks
- **POST** `/api/webhooks` - Handle Shopify webhooks
- **GET** `/api/webhooks` - Get webhook history

### Other Endpoints
- **GET** `/` - API information
- **GET** `/customers` - Customer management (if implemented)
- **GET** `/orders` - Order management (if implemented)
- **GET** `/users` - User management (if implemented)

### Example Requests

#### Create Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "price": "29.99",
    "description": "A test product",
    "status": "active",
    "metadata": {
      "vendor": "Test Vendor",
      "product_type": "Electronics"
    }
  }'
```

#### Get Products with Pagination
```bash
curl "http://localhost:3000/products?page=1&limit=10&search=test&status=active"
```

## 🧪 Testing

### Run All Tests
```bash
npm run test:api
```

### Run Simple Tests
```bash
node test-simple.js
```

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test product creation
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","price":"10.00"}'
```

## 🔧 Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Watch TypeScript compilation
npm run watch

# Run tests
npm run test:api

# Database operations
npm run migrate
npm run fix-db

# Code quality
npm run lint
npm run format
```

### Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Build** the project: `npm run build`
3. **Test** your changes: `npm run test:api`
4. **Start** the server: `npm start`

### Adding New Features

1. **Models**: Add new Sequelize models in `src/models/`
2. **Controllers**: Add business logic in `src/controllers/`
3. **Routes**: Define API endpoints in `src/routes/`
4. **Services**: Add reusable business logic in `src/services/`
5. **Validators**: Add input validation in `src/validators/`

## 🗄️ Database

### Models

#### Product Model
```typescript
{
  id: number (Primary Key)
  title: string (Required)
  description: text
  price: decimal(10,2) (Required)
  shopify_product_id: string
  status: enum('active', 'draft', 'archived')
  metadata: json
}
```

#### Webhook Model
```typescript
{
  id: number (Primary Key)
  topic: string (Required)
  shop_domain: string (Required)
  payload: json
  processed: boolean
  processed_at: timestamp
}
```

### Database Scripts

```bash
# Fix database issues
npm run fix-db

# Remove error column (if needed)
npm run remove-error

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:undo
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=3000
   # Add production database credentials
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Monitoring

The application provides a health endpoint at `/health` that returns:
- Server uptime
- Database connection status
- Product count
- Response time

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST"
}
```

## 🔒 Security Features

- **HMAC Verification**: Shopify webhook signature verification
- **CORS Protection**: Configurable CORS origins
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error responses
- **Rate Limiting**: (Can be added with express-rate-limit)

## 📊 Monitoring & Logging

- **Request Timing**: All requests are timed and logged
- **Error Logging**: Comprehensive error logging
- **Health Checks**: Built-in health monitoring
- **Database Status**: Connection status monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Build Errors**
   - Run `npm install` to ensure dependencies
   - Check TypeScript configuration
   - Verify all imports are correct

3. **Webhook Verification Fails**
   - Check `SHOPIFY_WEBHOOK_SECRET` in `.env`
   - Ensure raw body parsing is enabled
   - Verify HMAC calculation

4. **Tests Failing**
   - Ensure server is running on port 3000
   - Check database is accessible
   - Verify test data doesn't conflict

### Getting Help

- Check the logs for detailed error messages
- Run health check: `curl http://localhost:3000/health`
- Test individual endpoints manually
- Review the test suite for examples

---

**Happy coding! 🎉** 