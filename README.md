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

## 📁 Project Structure & File Relationships

```
shopify-webhook-project/
├── 📁 src/                          # Source code directory
│   ├── 📄 index.ts                  # 🚀 Main application entry point
│   │                                #    ├── Imports config.app from config/
│   │                                #    ├── Sets up middleware from middleware/
│   │                                #    ├── Registers routes from routes/
│   │                                #    └── Starts Express server
│   │
│   ├── 📁 config/                   # 🔧 Configuration & Database Setup
│   │   ├── 📄 config.app.ts         #    ├── Environment variables & app settings
│   │   ├── 📄 db.connection.ts      #    ├── Sequelize database connection
│   │   └── 📄 database.init.ts      #    └── Database initialization & model sync
│   │                                #         └── Links to all models
│   │
│   ├── 📁 models/                   # 🗄️ Database Models (Sequelize ORM)
│   │   ├── 📄 product.ts            #    ├── Product model definition
│   │   ├── 📄 customer.ts           #    ├── Customer model definition
│   │   ├── 📄 order.ts              #    ├── Order model definition  
│   │   ├── 📄 orderItem.ts          #    ├── OrderItem model definition
│   │   ├── 📄 webhook.ts            #    ├── Webhook model definition
│   │   └── 📄 user.ts               #    └── User model definition
│   │                                #         └── Each model defines associations
│   │
│   ├── 📁 routes/                   # 🛣️ API Route Definitions
│   │   ├── 📄 products.routes.ts    #    ├── Product endpoints → product.controller
│   │   ├── 📄 customer.routes.ts    #    ├── Customer endpoints → customer.controller
│   │   ├── 📄 order.routes.ts       #    ├── Order endpoints → order.controller
│   │   ├── 📄 orderItems.routes.ts  #    ├── OrderItem endpoints → order.controller
│   │   ├── 📄 webhook.routes.ts     #    ├── Webhook endpoints → webhook.controller
│   │   ├── 📄 user.routes.ts        #    ├── User endpoints → user.controller
│   │   ├── 📄 shopify.routes.ts     #    ├── Shopify API → shopify.controller
│   │   ├── 📄 shopify-admin.routes.ts#   ├── Shopify Admin → shopify.controller
│   │   └── 📄 health.routes.ts      #    └── Health check endpoint
│   │                                #         └── Each route uses middleware & validators
│   │
│   ├── 📁 controllers/              # 🎮 Request Controllers (Business Logic)
│   │   ├── 📄 product.controller.ts #    ├── Product CRUD → product.service
│   │   ├── 📄 customer.controller.ts#    ├── Customer CRUD → customer.service
│   │   ├── 📄 order.controller.ts   #    ├── Order CRUD → order.service
│   │   ├── 📄 webhook.controller.ts #    ├── Webhook processing → webhook.service
│   │   ├── 📄 user.controller.ts    #    ├── User management → user model
│   │   └── 📄 shopify.controller.ts #    └── Shopify integration → shopify.service
│   │                                #         └── Controllers use validators & utils
│   │
│   ├── 📁 services/                 # 🔧 Business Logic Services
│   │   ├── 📄 product.service.ts    #    ├── Product business logic → product model
│   │   ├── 📄 customer.service.ts   #    ├── Customer business logic → customer model
│   │   ├── 📄 order.service.ts      #    ├── Order business logic → order model
│   │   ├── 📄 orderItem.service.ts  #    ├── OrderItem logic → orderItem model
│   │   ├── 📄 webhook.service.ts    #    ├── Webhook processing → webhook model
│   │   ├── 📄 shopify.service.ts    #    ├── Shopify API calls → utils
│   │   ├── 📄 shopify-admin.service.ts# ├── Admin operations → models
│   │   └── 📄 queue.service.ts      #    └── Background job processing
│   │                                #         └── Services interact with models & utils
│   │
│   ├── 📁 middleware/               # 🛡️ Express Middleware
│   │   ├── 📄 errorHandler.ts       # Global error handling
│   │   ├── 📄 requestTiming.ts      # Request timing & logging
│   │   └── 📄 verifyShopifyWebhook.ts # Shopify webhook verification
│   │                                #              └── Uses validateWebhookSignature
│   │
│   ├── 📁 validators/               # ✅ Input Validation (Zod Schemas)
│   │   ├── 📄 product.validator.ts  #    ├── Product validation schemas
│   │   ├── 📄 customer.validator.ts #    ├── Customer validation schemas
│   │   ├── 📄 order.validator.ts    #    ├── Order validation schemas
│   │   └── 📄 webhook.validator.ts  #    └── Webhook validation schemas
│   │                                #         └── Used by controllers & routes
│   │
│   ├── 📁 utils/                    # 🛠️ Utility Functions
│   │   ├── 📄 responseHandler.ts    # Standardized API responses
│   │   ├── 📄 logger.ts             # Application logging
│   │   ├── 📄 phoneValidator.ts     # Phone number validation
│   │   ├── 📄 shopifyFormatter.ts   # Shopify data formatting
│   │   └── 📄 validateWebhookSignature.ts  # Webhook signature validation
│   │                                #         └── Used across services & controllers
│   │
│   ├── 📁 types/                    # 📝 TypeScript Type Definitions
│   │   ├── 📄 customerInterface.ts  #    ├── Customer interfaces & types
│   │   ├── 📄 shopifyInterface.ts   #    ├── Shopify API types
│   │   └── 📄 webhookInterface.ts   #    └── Webhook interfaces
│   │                                #         └── Used throughout the application
│   │
│   ├── 📁 webhookHandlers/          # 🔄 Webhook Event Processors
│   │   └── [Event-specific handlers] #         └── Process different webhook events
│   │
│   ├── 📁 jobs/                     # ⚡ Background Job Definitions
│   │   └── [Job processors]         #         └── Queue job processing
│   │
│   ├── 📁 queues/                   # 📋 Queue Management
│   │   └── [Queue configurations]   #         └── BullMQ queue setup
│   │
│   ├── 📁 workers/                  # 👷 Background Workers
│   │   └── [Worker processes]       #         └── Process queued jobs
│   │
│   └── 📁 examples/                 # 📚 Code Examples & Demos
│       └── [Example implementations]
│
├── 📁 config/                       # 🔧 External Configuration
│   └── [Sequelize config files]
│
├── 📁 migrations/                   # 🗄️ Database Migrations
│   └── [Migration files]
│
├── 📁 seeders/                      # 🌱 Database Seeders
│   └── [Seed data files]
│
├── 📁 scripts/                      # 🔨 Utility Scripts
│   └── [Database & deployment scripts]
│
├── 📁 sql-queries/                  # 📊 SQL Query Files
│   └── [Raw SQL queries]
│
├── 📁 dist/                         # 📦 Compiled JavaScript Output
│   └── [Compiled TypeScript files]
│
├── 📁 node_modules/                 # 📚 Dependencies
├── 📄 package.json                  # 📋 Project configuration & dependencies
├── 📄 tsconfig.json                 # ⚙️ TypeScript configuration
├── 📄 Dockerfile                    # 🐳 Docker configuration
└── 📄 README.md                     # 📖 This documentation
```

### 🔗 File Relationship Flow

```
Request Flow:
📡 HTTP Request
  ↓
🛣️ [entity].routes.ts
  ↓ (applies middleware)
🛡️ [middleware].ts
  ↓ (validates input)
✅ [entity].validator.ts
  ↓ (processes request)
🎮 [entity].controller.ts
  ↓ (business logic)
🔧 [entity].service.ts
  ↓ (database operations)
🗄️ [entity].ts
  ↓ (formats response)
🛠️ responseHandler.ts
  ↓
📡 HTTP Response

Data Flow:
🗄️ models.[entity].ts ←→ 🔧 services.[entity].ts ←→ 🎮 controllers.[entity].ts
                      ↓                              ↓
                🛠️ utils.[helpers].ts    ✅ validators.[entity].ts

Configuration Flow:
🚀 index.ts → 🔧 config.app.ts → 🗄️ db.connection.ts → 📄 database.init.ts → 🗄️ models.*
```

### 🔗 Detailed File Relationships with Examples

#### 📊 Product Feature Flow
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Product Management Flow                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  📡 GET /products?page=1&limit=10                                              │
│     ↓                                                                          │
│  🛣️ products.routes.ts                                                         │
│     ├── Applies: requestTiming.ts                                             │
│     ├── Validates: product.validator.ts (query params)                       │
│     └── Routes to: product.controller.ts                                     │
│           ↓                                                                    │
│  🎮 product.controller.ts                                                     │
│     ├── Calls: product.service.ts.getAllProducts()                          │
│     └── Uses: responseHandler.ts                                             │
│           ↓                                                                    │
│  🔧 product.service.ts                                                        │
│     ├── Queries: product.ts (Sequelize)                                     │
│     ├── Uses: logger.ts                                                      │
│     └── Applies business logic                                                │
│           ↓                                                                    │
│  🗄️ product.ts                                                                │
│     ├── Sequelize model definition                                            │
│     ├── Associations with: orderItem.ts                                      │
│     └── Database table: products                                              │
│           ↓                                                                    │
│  📡 Response: JSON with products array + pagination                           │
│                                                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 🔄 Webhook Processing Flow
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Shopify Webhook Processing                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  📡 POST /api/webhooks (Shopify webhook)                                       │
│     ↓                                                                          │
│  🛣️ routes.webhooks.ts                                                         │
│     ├── Applies: middleware.verify-shopify.ts                                 │
│     │   └── Uses: utils.validate-webhook.ts                                   │
│     ├── Validates: validators.webhook.ts                                       │
│     └── Routes to: controllers.webhook.ts                                     │
│           ↓                                                                    │
│  🎮 controllers.webhook.ts                                                     │
│     ├── Calls: services.webhook.ts.processWebhook()                          │
│     ├── Logs: utils.logger.ts                                                │
│     └── Queues: services.queue.ts (for async processing)                     │
│           ↓                                                                    │
│  🔧 services.webhook.ts                                                        │
│     ├── Stores: models.webhook.ts                                            │
│     ├── Updates: models.product.ts (if product webhook)                       │
│     ├── Updates: models.customer.ts (if customer webhook)                     │
│     └── Updates: models.order.ts (if order webhook)                          │
│           ↓                                                                    │
│  🗄️ Database Updates                                                           │
│     ├── webhooks table (log entry)                                            │
│     └── Respective entity table (product/customer/order)                      │
│                                                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 🏗️ Application Bootstrap Flow
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Application Startup Sequence                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  🚀 index.ts (Entry Point)                                                     │
│     ├── Loads: config.app.ts                                                  │
│     │   └── Reads environment variables                                        │
│     ├── Connects: config.database.ts                                          │
│     │   └── Establishes PostgreSQL connection                                  │
│     ├── Initializes: database.init.ts                                         │
│     │   ├── Syncs: models.product.ts                                          │
│     │   ├── Syncs: models.customer.ts                                         │
│     │   ├── Syncs: models.order.ts                                            │
│     │   ├── Syncs: models.order-item.ts                                       │
│     │   ├── Syncs: models.webhook.ts                                          │
│     │   └── Syncs: models.user.ts                                             │
│     ├── Applies Middleware:                                                    │
│     │   ├── middleware.request-timing.ts                                      │
│     │   ├── middleware.error-handler.ts                                       │
│     │   └── Express built-ins (CORS, JSON parser)                             │
│     ├── Registers Routes:                                                      │
│     │   ├── routes.products.ts                                                │
│     │   ├── routes.customers.ts                                               │
│     │   ├── routes.orders.ts                                                  │
│     │   ├── routes.webhooks.ts                                                │
│     │   ├── routes.users.ts                                                   │
│     │   └── routes.health.ts                                                  │
│     └── Starts server on configured port                                       │
│                                                                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 📋 Model Associations & Dependencies
```
Database Models Relationship Map:

🗄️ models.customer.ts
   ├── hasMany → models.order.ts
   └── Uses → types.customer.ts

🗄️ models.order.ts  
   ├── belongsTo → models.customer.ts
   ├── hasMany → models.order-item.ts
   └── Uses → types.order.ts

🗄️ models.order-item.ts
   ├── belongsTo → models.order.ts
   ├── belongsTo → models.product.ts
   └── Contains quantity, price data

🗄️ models.product.ts
   ├── hasMany → models.order-item.ts
   └── Uses → types.product.ts

🗄️ models.webhook.ts
   ├── Stores webhook logs
   └── Uses → types.webhook.ts

🗄️ models.user.ts
   └── Authentication/authorization data
```

## 📝 File Naming Conventions & Best Practices

### 🎯 Current File Naming Pattern

**Consistent Structure (Already Implemented)**

```
# Current Structure - Well Organized
src/models/product.ts                  ✅ Database model definitions
src/models/customer.ts                 ✅ Database model definitions
src/controllers/product.controller.ts  ✅ Request handlers  
src/services/product.service.ts        ✅ Business logic services
src/routes/products.routes.ts          ✅ API route definitions
src/validators/product.validator.ts    ✅ Input validation schemas
src/utils/responseHandler.ts           ✅ Utility functions (camelCase)
src/middleware/errorHandler.ts         ✅ Express middleware (camelCase)
```

### 🔄 Benefits of Current Naming Convention

1. **Clear Purpose**: `.controller.ts`, `.service.ts`, `.routes.ts` clearly indicate file type
2. **Intuitive Structure**: Easy to understand what each file does
3. **Standard Pattern**: Follows common Node.js/Express conventions
4. **IDE Friendly**: Good autocomplete and file navigation
5. **Maintainable**: Easy to find and organize related files

### 📂 File Naming Rules

| Directory | Pattern | Example | Purpose |
|-----------|---------|---------|---------|
| `models/` | `{entity}.ts` | `product.ts` | Database model definitions |
| `controllers/` | `{entity}.controller.ts` | `product.controller.ts` | Request handlers |
| `services/` | `{entity}.service.ts` | `product.service.ts` | Business logic |
| `routes/` | `{entity}.routes.ts` | `products.routes.ts` | API route definitions |
| `validators/` | `{entity}.validator.ts` | `product.validator.ts` | Input validation schemas |
| `utils/` | `camelCase.ts` | `responseHandler.ts` | Helper functions |
| `middleware/` | `camelCase.ts` | `errorHandler.ts` | Express middleware |
| `types/` | `{domain}Interface.ts` | `customerInterface.ts` | TypeScript interfaces |
| `config/` | `camelCase.ts` | `config.ts`, `db.ts` | Configuration files |

### 📋 Current File Organization Benefits

✅ **No migration needed** - Your current structure is already well-organized!

The existing naming convention provides:
- **Clear identification** of file types through suffixes
- **Logical grouping** within directories  
- **Standard patterns** commonly used in Node.js projects
- **Easy navigation** and file discovery

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