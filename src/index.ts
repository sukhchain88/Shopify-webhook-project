/**
 * Shopify Webhook Handler - Main Server Entry Point
 * 
 * This is the main server file that sets up Express.js with all routes,
 * middleware, and database connections for handling Shopify webhooks
 * and product management.
 * 
 * @author Your Name
 * @version 1.0.0
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import * as dotenv from "dotenv";

// Import security middleware
import { 
  helmetConfig, 
  generalRateLimit, 
  webhookRateLimit,
  sanitizeRequest,
  requestSizeLimit
} from "./middleware/security.js";

// Import route handlers
import productRoutes from "./routes/ProductRoutes.js";
import webhookRoutes from "./routes/WebhookRoutes.js";
import shopifyRoutes from "./routes/ShopifyRoutes.js";
import shopifyAdminRoutes from "./routes/ShopifyAdminRoutes.js";
import customerRoutes from "./routes/CustomerRoutes.js";
import orderRoutes from "./routes/OrderRoutes.js";
import orderItemsRoutes from "./routes/OrderItemRoutes.js";
import healthRoutes from "./routes/HealthRoutes.js";
import userRouter from "./routes/UserRoutes.js";

// Import middleware
import { requestTiming } from "./middleware/requestTiming.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Import database connection
import "./config/db.js"; // This initializes the database connection

// Load environment variables
dotenv.config();

/**
 * Initialize Express application
 */
const app = express();

/**
 * Security Middleware
 * Applied before other middleware for maximum protection
 */
app.use(helmetConfig);
app.use(compression());

/**
 * Request Logging (in development)
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

/**
 * CORS Configuration
 * Allow cross-origin requests for API access
 */
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

/**
 * Trust proxy for accurate IP addresses behind reverse proxies
 */
app.set('trust proxy', 1);

/**
 * Request Timing Middleware
 * Logs request duration for performance monitoring
 */
app.use(requestTiming);

/**
 * General Security Middleware
 */
app.use(requestSizeLimit);
app.use(generalRateLimit);
app.use(sanitizeRequest);

/**
 * Body Parsing Middleware
 * 
 * IMPORTANT: Order matters here!
 * 1. Raw body parser for webhooks (must come first)
 * 2. JSON parser for regular API endpoints
 */

// Raw body parser for webhook endpoints
// Shopify sends webhooks as raw JSON that needs HMAC verification
app.use("/api/webhooks", express.raw({ 
  type: "application/json",
  limit: '10mb' // Increase limit for large webhook payloads
}));

// JSON parser for all other endpoints
app.use(express.json({ 
  limit: '10mb' // Increase limit for large requests
}));

// URL-encoded parser for form data
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

/**
 * API Routes Configuration
 * 
 * Routes are organized by functionality:
 * - /health: Server health checks
 * - /products: Product CRUD operations
 * - /api/webhooks: Shopify webhook handlers
 * - /shopify: Shopify API integration
 * - /api/shopify-admin: Shopify Admin API operations
 * - /customers: Customer management
 * - /orders: Order management
 * - /api/order-items: Order items and product relationships
 * - /users: User management
 */

// Health check endpoint (should be first for monitoring)
app.use("/health", healthRoutes);

// Product management routes
app.use("/products", productRoutes);

// Webhook handling routes (with raw body parsing and specific rate limiting)
app.use("/api/webhooks", webhookRateLimit, webhookRoutes);

// Shopify integration routes
app.use("/shopify", shopifyRoutes);

// Shopify Admin API routes
app.use("/api/shopify-admin", shopifyAdminRoutes);

// Customer management routes
app.use("/customers", customerRoutes);

// Order management routes
app.use("/orders", orderRoutes);

// Order items and product relationships routes
app.use("/api/order-items", orderItemsRoutes);

// User management routes
app.use("/users", userRouter);

/**
 * Root endpoint - API information
 */
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Shopify Webhook Handler API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      products: "/products",
      webhooks: "/api/webhooks",
      shopify: "/shopify",
      "shopify-admin": "/api/shopify-admin",
      customers: "/customers",
      orders: "/orders",
      "order-items": "/api/order-items",
      users: "/users"
    },
    documentation: "See README.md for API documentation"
  });
});

/**
 * 404 Handler - Route not found
 */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global Error Handler
 * Catches all unhandled errors and returns consistent error responses
 */
app.use(errorHandler);

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
const startServer = async () => {
  try {
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`📚 Health Check: http://localhost:${PORT}/health`);
      
      if (NODE_ENV === 'development') {
        console.log(`🧪 Test the API with: node tests/api-tests.js`);
      }
    });

    /**
     * Graceful Shutdown Handler
     * Properly close database connections and server on shutdown
     */
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

/**
 * Unhandled Promise Rejection Handler
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in production, just log the error
  if (NODE_ENV !== 'production') {
    process.exit(1);
  }
});

/**
 * Uncaught Exception Handler
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default app;
