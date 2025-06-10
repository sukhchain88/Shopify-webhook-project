import express from "express";
import { Product } from "../models/Product.js";
import sequelize from "../config/db.js";
const router = express.Router();
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
        await sequelize.authenticate();
        healthcheck.database = "connected";
        const count = await Product.count();
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
export default router;
