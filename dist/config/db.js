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
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/db.ts
const sequelize_1 = require("sequelize");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || "",
    port: parseInt(process.env.DB_PORT || "5432"),
    dialect: "postgres",
    dialectOptions: {
        // Enable SSL for managed databases (DigitalOcean, AWS RDS, etc.)
        // Check if we're using a managed database service that requires SSL
        ssl: process.env.DB_HOST?.includes('digitalocean') ||
            process.env.DB_HOST?.includes('amazonaws') ||
            process.env.DB_HOST?.includes('azure') ||
            process.env.DB_USER === 'doadmin' ||
            process.env.NODE_ENV === "production" ? {
            require: true,
            rejectUnauthorized: false, // Allow self-signed certificates for managed services
        } : false
    },
    // Optimized connection pool settings for production
    pool: {
        max: process.env.NODE_ENV === "production" ? 20 : 5,
        min: process.env.NODE_ENV === "production" ? 5 : 0,
        acquire: 60000, // Increased for better reliability  
        idle: 10000,
        evict: 1000
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    retry: {
        match: [
            /ConnectionError/,
            /ConnectionRefusedError/,
            /ConnectionTimedOutError/,
            /TimeoutError/,
        ],
        max: 3
    }
});
// Test connection (useful in dev mode)
sequelize
    .authenticate()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.error("🔥 Connection error:", err));
exports.default = sequelize;
