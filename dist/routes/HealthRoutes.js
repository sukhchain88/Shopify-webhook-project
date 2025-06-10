"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = require("../models/Product");
const db_1 = __importDefault(require("../config/db"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    const startTime = Date.now();
    const healthcheck = {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        status: "healthy",
        database: "unknown",
        productCount: 0
    };
    try {
        await db_1.default.authenticate();
        healthcheck.database = "connected";
        const count = await Product_1.Product.count();
        healthcheck.productCount = count;
        res.status(200).json({
            ...healthcheck,
            duration: `${Date.now() - startTime}ms`
        });
    }
    catch (error) {
        healthcheck.database = "disconnected";
        console.error("Health check failed:", error);
        res.status(503).json({
            ...healthcheck,
            error: "Service unavailable",
            details: error instanceof Error ? error.message : "Unknown error",
            duration: `${Date.now() - startTime}ms`
        });
    }
});
exports.default = router;
