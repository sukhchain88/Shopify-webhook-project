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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_CONFIG = exports.DB_PASSWORD = exports.DB_USER = exports.DB_NAME = exports.DB_PORT = exports.DB_HOST = exports.WEBHOOK_BASE_URL = exports.SHOPIFY_WEBHOOK_SECRET = exports.SHOPIFY_ACCESS_TOKEN = exports.SHOPIFY_STORE_URL = exports.NODE_ENV = exports.PORT = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
_a = process.env, _b = _a.PORT, exports.PORT = _b === void 0 ? "3000" : _b, _c = _a.NODE_ENV, exports.NODE_ENV = _c === void 0 ? "development" : _c, exports.SHOPIFY_STORE_URL = _a.SHOPIFY_STORE_URL, exports.SHOPIFY_ACCESS_TOKEN = _a.SHOPIFY_ACCESS_TOKEN, exports.SHOPIFY_WEBHOOK_SECRET = _a.SHOPIFY_WEBHOOK_SECRET, exports.WEBHOOK_BASE_URL = _a.WEBHOOK_BASE_URL, exports.DB_HOST = _a.DB_HOST, exports.DB_PORT = _a.DB_PORT, exports.DB_NAME = _a.DB_NAME, exports.DB_USER = _a.DB_USER, exports.DB_PASSWORD = _a.DB_PASSWORD;
if (!exports.SHOPIFY_STORE_URL || !exports.SHOPIFY_ACCESS_TOKEN) {
    console.warn("⚠️ Warning: Shopify API credentials are not properly configured.");
}
if (!exports.SHOPIFY_WEBHOOK_SECRET) {
    if (exports.NODE_ENV === "production") {
        console.error("🚨 ERROR: SHOPIFY_WEBHOOK_SECRET is not set in .env file!");
        console.error("Please set SHOPIFY_WEBHOOK_SECRET to the value from your Shopify admin panel:");
        console.error("1. Go to Shopify admin > Settings > Notifications > Webhooks");
        console.error("2. Copy the webhook signing secret");
        console.error("3. Add it to your .env file as SHOPIFY_WEBHOOK_SECRET=your_secret");
        process.exit(1);
    }
    else {
        console.warn("⚠️ Warning: SHOPIFY_WEBHOOK_SECRET is not set in .env file!");
        console.warn("Webhook signature validation will be skipped in development mode.");
        console.warn("For production, please set SHOPIFY_WEBHOOK_SECRET in your .env file.");
    }
}
exports.DB_CONFIG = {
    host: exports.DB_HOST || "localhost",
    port: parseInt(exports.DB_PORT || "5432", 10),
    database: exports.DB_NAME,
    username: exports.DB_USER,
    password: exports.DB_PASSWORD,
};
