"use strict";
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
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv = __importStar(require("dotenv"));
const security_1 = require("./middleware/security");
const ProductRoutes_1 = __importDefault(require("./routes/ProductRoutes"));
const WebhookRoutes_1 = __importDefault(require("./routes/WebhookRoutes"));
const ShopifyRoutes_1 = __importDefault(require("./routes/ShopifyRoutes"));
const ShopifyAdminRoutes_1 = __importDefault(require("./routes/ShopifyAdminRoutes"));
const CustomerRoutes_1 = __importDefault(require("./routes/CustomerRoutes"));
const OrderRoutes_1 = __importDefault(require("./routes/OrderRoutes"));
const OrderItemRoutes_1 = __importDefault(require("./routes/OrderItemRoutes"));
const HealthRoutes_1 = __importDefault(require("./routes/HealthRoutes"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const requestTiming_1 = require("./middleware/requestTiming");
const errorHandler_1 = require("./middleware/errorHandler");
const initDatabase_1 = require("./config/initDatabase");
dotenv.config();
const app = (0, express_1.default)();
app.use(security_1.helmetConfig);
app.use((0, compression_1.default)());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('combined'));
}
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));
app.set('trust proxy', 1);
app.use(requestTiming_1.requestTiming);
app.use(security_1.requestSizeLimit);
app.use(security_1.generalRateLimit);
app.use(security_1.sanitizeRequest);
app.use("/api/webhooks", express_1.default.raw({
    type: "application/json",
    limit: '10mb'
}));
app.use(express_1.default.json({
    limit: '10mb'
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.use("/health", HealthRoutes_1.default);
app.use("/products", ProductRoutes_1.default);
app.use("/api/webhooks", security_1.webhookRateLimit, WebhookRoutes_1.default);
app.use("/shopify", ShopifyRoutes_1.default);
app.use("/api/shopify-admin", ShopifyAdminRoutes_1.default);
app.use("/customers", CustomerRoutes_1.default);
app.use("/orders", OrderRoutes_1.default);
app.use("/api/order-items", OrderItemRoutes_1.default);
app.use("/users", UserRoutes_1.default);
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
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const startServer = async () => {
    try {
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
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERM received, shutting down gracefully...');
            server.close(async () => {
                await (0, initDatabase_1.closeDatabase)();
                console.log('✅ Server closed');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            console.log('🛑 SIGINT received, shutting down gracefully...');
            server.close(async () => {
                await (0, initDatabase_1.closeDatabase)();
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
startServer();
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    if (NODE_ENV !== 'production') {
        process.exit(1);
    }
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
exports.default = app;
