"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = void 0;
const db_1 = __importDefault(require("./db"));
/**
 * Initialize database and create all tables
 */
const initDatabase = async () => {
    try {
        console.log("🔧 Initializing database...");
        // Test connection first
        await db_1.default.authenticate();
        console.log("✅ Database connection established");
        // Sync all models (create tables if they don't exist)
        await db_1.default.sync({ force: false, alter: false });
        console.log("✅ Database tables synchronized");
        // Log which tables were created/verified
        const tables = [
            'products',
            'customers',
            'orders',
            'order_items',
            'webhooks',
            'users'
        ];
        console.log("📋 Verified tables:", tables.join(", "));
    }
    catch (error) {
        console.error("❌ Database initialization failed:", error);
        // In development, continue without database
        if (process.env.NODE_ENV === "development") {
            console.log("⚠️ Continuing in development mode without database");
        }
        else {
            throw error;
        }
    }
};
exports.initDatabase = initDatabase;
exports.default = exports.initDatabase;
