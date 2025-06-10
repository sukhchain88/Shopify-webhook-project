import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import * as dotenv from "dotenv";
import { helmetConfig, generalRateLimit, webhookRateLimit, sanitizeRequest, requestSizeLimit } from "./middleware/security";
import productRoutes from "./routes/ProductRoutes";
import webhookRoutes from "./routes/WebhookRoutes";
import shopifyRoutes from "./routes/ShopifyRoutes";
import shopifyAdminRoutes from "./routes/ShopifyAdminRoutes";
import customerRoutes from "./routes/CustomerRoutes";
import orderRoutes from "./routes/OrderRoutes";
import orderItemsRoutes from "./routes/OrderItemRoutes";
import healthRoutes from "./routes/HealthRoutes";
import userRouter from "./routes/UserRoutes";
import { requestTiming } from "./middleware/requestTiming";
import { errorHandler } from "./middleware/errorHandler";
import { initDatabase, closeDatabase } from "./config/initDatabase";
dotenv.config();
const app = express();
app.use(helmetConfig);
app.use(compression());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'));
}
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));
app.set('trust proxy', 1);
app.use(requestTiming);
app.use(requestSizeLimit);
app.use(generalRateLimit);
app.use(sanitizeRequest);
app.use("/api/webhooks", express.raw({
    type: "application/json",
    limit: '10mb'
}));
app.use(express.json({
    limit: '10mb'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.use("/health", healthRoutes);
app.use("/products", productRoutes);
app.use("/api/webhooks", webhookRateLimit, webhookRoutes);
app.use("/shopify", shopifyRoutes);
app.use("/api/shopify-admin", shopifyAdminRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/api/order-items", orderItemsRoutes);
app.use("/users", userRouter);
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
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const startServer = async () => {
    try {
        await initDatabase();
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
                await closeDatabase();
                console.log('✅ Server closed');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            console.log('🛑 SIGINT received, shutting down gracefully...');
            server.close(async () => {
                await closeDatabase();
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
export default app;
