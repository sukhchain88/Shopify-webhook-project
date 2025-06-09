"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
// Import route handlers
const ProductRoutes_1 = __importDefault(require("./routes/ProductRoutes"));
const WebhookRoutes_1 = __importDefault(require("./routes/WebhookRoutes"));
const ShopifyRoutes_1 = __importDefault(require("./routes/ShopifyRoutes"));
const ShopifyAdminRoutes_1 = __importDefault(require("./routes/ShopifyAdminRoutes"));
const CustomerRoutes_1 = __importDefault(require("./routes/CustomerRoutes"));
const OrderRoutes_1 = __importDefault(require("./routes/OrderRoutes"));
const OrderItemRoutes_1 = __importDefault(require("./routes/OrderItemRoutes"));
const HealthRoutes_1 = __importDefault(require("./routes/HealthRoutes"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
// Import middleware
const requestTiming_1 = require("./middleware/requestTiming");
const errorHandler_1 = require("./middleware/errorHandler");
// Import database connection
require("./config/db"); // This initializes the database connection
const initDatabase_1 = require("./config/initDatabase"); // Initialize database tables
// Load environment variables
dotenv.config();
/**
 * Initialize Express application
 */
const app = (0, express_1.default)();
/**
 * CORS Configuration
 * Allow cross-origin requests for API access
 */
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));
/**
 * Request Timing Middleware
 * Logs request duration for performance monitoring
 */
app.use(requestTiming_1.requestTiming);
/**
 * Body Parsing Middleware
 *
 * IMPORTANT: Order matters here!
 * 1. Raw body parser for webhooks (must come first)
 * 2. JSON parser for regular API endpoints
 */
// Raw body parser for webhook endpoints
// Shopify sends webhooks as raw JSON that needs HMAC verification
app.use("/api/webhooks", express_1.default.raw({
    type: "application/json",
    limit: '10mb' // Increase limit for large webhook payloads
}));
// JSON parser for all other endpoints
app.use(express_1.default.json({
    limit: '10mb' // Increase limit for large requests
}));
// URL-encoded parser for form data
app.use(express_1.default.urlencoded({
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
app.use("/health", HealthRoutes_1.default);
// Product management routes
app.use("/products", ProductRoutes_1.default);
// Webhook handling routes (with raw body parsing)
app.use("/api/webhooks", WebhookRoutes_1.default);
// Shopify integration routes
app.use("/shopify", ShopifyRoutes_1.default);
// Shopify Admin API routes
app.use("/api/shopify-admin", ShopifyAdminRoutes_1.default);
// Customer management routes
app.use("/customers", CustomerRoutes_1.default);
// Order management routes
app.use("/orders", OrderRoutes_1.default);
// Order items and product relationships routes
app.use("/api/order-items", OrderItemRoutes_1.default);
// User management routes
app.use("/users", UserRoutes_1.default);
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
app.use(errorHandler_1.errorHandler);
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
        // Initialize database first
        await (0, initDatabase_1.initDatabase)();
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
    }
    catch (error) {
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
exports.default = app;
