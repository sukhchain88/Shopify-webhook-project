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
const sequelize_1 = require("sequelize");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const sequelize = process.env.DATABASE_URL
    ? new sequelize_1.Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: process.env.NODE_ENV === "production" ? {
                require: true,
                rejectUnauthorized: false,
            } : false
        },
        pool: {
            max: process.env.NODE_ENV === "production" ? 20 : 5,
            min: process.env.NODE_ENV === "production" ? 5 : 0,
            acquire: 60000,
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
    })
    : new sequelize_1.Sequelize(process.env.DB_NAME || "shopify_webhook_db", process.env.DB_USER || "postgres", process.env.DB_PASSWORD || "", {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        dialectOptions: {
            ssl: process.env.DB_HOST?.includes('digitalocean') ||
                process.env.DB_HOST?.includes('amazonaws') ||
                process.env.DB_HOST?.includes('azure') ||
                process.env.DB_USER === 'doadmin' ||
                process.env.NODE_ENV === "production" ? {
                require: true,
                rejectUnauthorized: false,
            } : false
        },
        pool: {
            max: process.env.NODE_ENV === "production" ? 20 : 5,
            min: process.env.NODE_ENV === "production" ? 5 : 0,
            acquire: 60000,
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
sequelize
    .authenticate()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.error("🔥 Connection error:", err));
exports.default = sequelize;
