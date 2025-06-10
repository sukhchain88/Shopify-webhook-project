# 🚀 Shopify Webhook Handler Project

A comprehensive TypeScript/Node.js application for handling Shopify webhooks with product management, built with Express.js, PostgreSQL, and BullMQ.

## ✨ Features

- **Shopify Integration**: Full webhook handling for orders, products, and customers
- **RESTful API**: Complete CRUD operations for products, orders, and customers
- **Background Jobs**: Queue-based processing with BullMQ and Redis
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: Comprehensive security middleware (Helmet, rate limiting, CORS)
- **TypeScript**: Full type safety with modern ES modules
- **Monitoring**: Request logging and error tracking
- **Validation**: Zod schema validation for all endpoints

## 🏗️ Architecture

```
src/
├── config/          # Database and application configuration
├── controllers/     # Route handlers and business logic
├── models/         # Sequelize database models
├── routes/         # Express route definitions
├── services/       # Business logic and external API integration
├── middleware/     # Custom middleware (auth, error handling, security)
├── validators/     # Request validation schemas
├── webhookHandlers/# Shopify webhook processing logic
├── jobs/           # Background job processors
├── queues/         # Queue configuration and types
├── workers/        # Background job workers
├── utils/          # Utility functions and helpers
└── types/          # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- Redis server
- Shopify store with API access

### Installation

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
   cp env.example .env
   # Edit .env with your actual configuration
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb shopify_webhook_db
   
   # The application will automatically create tables on startup
   ```

5. **Build and start**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Key configuration options (see `env.example` for complete list):

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `SHOPIFY_STORE_URL` | Your Shopify store URL | Yes |
| `SHOPIFY_ACCESS_TOKEN` | Shopify Admin API token | Yes |
| `SHOPIFY_WEBHOOK_SECRET` | Webhook signature secret | Yes (production) |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `REDIS_URL` | Redis connection URL | No (uses localhost) |

### Shopify Setup

1. **Create a Shopify App**
   - Go to Shopify Partners Dashboard
   - Create a new app or use existing one
   - Get Admin API access token

2. **Configure Webhooks**
   - In your Shopify admin: Settings → Notifications → Webhooks
   - Add webhook endpoints:
     - `https://your-app.com/api/webhooks/shopify/orders/create`
     - `https://your-app.com/api/webhooks/shopify/products/update`
     - etc.

## 📡 API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://your-app.com`

### Authentication
Currently API endpoints are public. For production, implement authentication:
```typescript
// Example: Add auth middleware to protected routes
app.use('/api/admin', authMiddleware, adminRoutes);
```

### Endpoints

#### Health Check
```http
GET /health
```

#### Products
```http
GET    /products              # List all products
GET    /products/:id          # Get product by ID
POST   /products              # Create new product
PUT    /products/:id          # Update product
DELETE /products/:id          # Delete product
```

#### Orders
```http
GET    /orders                # List all orders
GET    /orders/:id            # Get order by ID
POST   /orders                # Create new order
PUT    /orders/:id            # Update order
```

#### Webhooks
```http
POST   /api/webhooks/shopify/orders/create     # Order created
POST   /api/webhooks/shopify/products/update   # Product updated
POST   /api/webhooks/shopify/customers/create  # Customer created
```

### Request/Response Examples

#### Create Product
```http
POST /products
Content-Type: application/json

{
  "title": "Amazing Product",
  "description": "Product description",
  "price": 29.99,
  "status": "active"
}
```

#### Response
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "title": "Amazing Product",
    "price": "29.99",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## 🔒 Security Features

- **Helmet.js**: Security headers (CSP, HSTS, etc.)
- **Rate Limiting**: Configurable per endpoint
- **Request Sanitization**: XSS prevention
- **CORS**: Configurable cross-origin policies
- **Request Size Limiting**: Prevent large payload attacks
- **Webhook Signature Verification**: Shopify webhook authenticity

### Security Headers Applied
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## 🚦 Background Jobs

The application uses BullMQ for background job processing:

### Job Types
- **Email Jobs**: Send notifications
- **Webhook Jobs**: Process webhook data
- **Sync Jobs**: Synchronize with Shopify

### Monitoring Jobs
```bash
# View job queues (if Redis CLI available)
redis-cli
> KEYS bull:*
```

## 🧪 Testing

### Manual API Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test product creation
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Product","price":19.99}'
```

### Running Tests
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:api        # API integration tests
```

## 📊 Monitoring & Logging

### Request Logging
- Development: Detailed Morgan logging
- Production: Error-level logging only

### Error Tracking
- Comprehensive error handling middleware
- Structured error responses
- Stack traces in development

### Health Monitoring
```http
GET /health
```
Returns server status, database connectivity, and system information.

## 🚀 Deployment

### Render.com (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy with:
   - Build Command: `npm run build`
   - Start Command: `npm start`

### Docker (Alternative)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- Set all required environment variables
- Configure PostgreSQL database
- Set up Redis instance
- Configure Shopify webhooks to point to your domain

## 🔧 Development

### Scripts
```bash
npm run dev          # Development with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation

### Database Migrations
The application uses Sequelize with auto-sync in development:
```typescript
// For production, disable auto-sync and use migrations
await sequelize.sync({ force: false, alter: false });
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify credentials in .env file
```

**Redis Connection Error**
```bash
# Check Redis is running
redis-cli ping

# Should return PONG
```

**Shopify Webhook Issues**
- Verify webhook URL is accessible
- Check webhook secret matches
- Ensure proper HTTP methods are used

### Support
- Create an issue in the repository
- Check the documentation
- Review error logs in console

## 🙏 Acknowledgments

- Express.js for the web framework
- Sequelize for PostgreSQL ORM
- BullMQ for job queue management
- Shopify for webhook documentation
- TypeScript community for excellent tooling 