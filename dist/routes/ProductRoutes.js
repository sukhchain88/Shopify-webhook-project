"use strict";
/**
 * Product Routes
 *
 * Handles all product-related API endpoints including:
 * - GET /products - Get all products with pagination
 * - GET /products/:id - Get a specific product by ID
 * - POST /products - Create a new product
 * - PUT /products/:id - Update an existing product
 * - DELETE /products/:id - Delete a product
 * - POST /products/test-webhook - Test product webhook processing
 *
 * @author Your Name
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src\routes\products.routes.ts
// src\routes\products.routes.js
const express_1 = __importDefault(require("express"));
const ProductController_1 = require("../controllers/ProductController");
const errorHandler_1 = require("../middleware/errorHandler");
const productHandler_1 = require("../webhookHandlers/productHandler");
const Product_1 = require("../models/Product");
const router = express_1.default.Router();
/**
 * @route   GET /products
 * @desc    Get all products with optional pagination and filtering
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   search - Search term for product title
 * @query   status - Filter by product status (active, draft, archived)
 */
router.get("/", (0, errorHandler_1.asyncHandler)(ProductController_1.getAllProducts));
/**
 * @route   GET /products/:id
 * @desc    Get a specific product by ID
 * @access  Public
 * @param   id - Product ID
 */
router.get("/:id", (0, errorHandler_1.asyncHandler)(ProductController_1.getProductById));
/**
 * @route   POST /products
 * @desc    Create a new product
 * @access  Public (should be protected in production)
 * @body    title - Product title (required)
 * @body    price - Product price (required)
 * @body    description - Product description (optional)
 * @body    status - Product status (optional, default: active)
 * @body    metadata - Additional product metadata (optional)
 */
router.post("/", (0, errorHandler_1.asyncHandler)(ProductController_1.createProduct));
/**
 * @route   PUT /products/:id
 * @desc    Update an existing product
 * @access  Public (should be protected in production)
 * @param   id - Product ID
 * @body    Any product fields to update
 */
router.put("/:id", (0, errorHandler_1.asyncHandler)(ProductController_1.updateProduct));
/**
 * @route   DELETE /products/:id
 * @desc    Delete a product
 * @access  Public (should be protected in production)
 * @param   id - Product ID
 */
router.delete("/:id", (0, errorHandler_1.asyncHandler)(ProductController_1.deleteProduct));
/**
 * @route   POST /products/test-webhook
 * @desc    Test product webhook processing without signature validation
 * @access  Public
 * @body    Shopify product webhook payload
 */
router.post("/test-webhook", async (req, res) => {
    try {
        const webhookPayload = req.body;
        console.log("🧪 Testing product webhook:", JSON.stringify(webhookPayload, null, 2));
        // Validate basic required fields
        if (!webhookPayload || !webhookPayload.id) {
            return res.status(400).json({
                success: false,
                message: "Invalid webhook payload - missing id field",
                received: webhookPayload
            });
        }
        // Add webhook_type if not present
        if (!webhookPayload.webhook_type) {
            webhookPayload.webhook_type = 'products/create'; // Default for testing
        }
        try {
            // Process using the product webhook handler
            await (0, productHandler_1.handleProductWebhook)(webhookPayload);
            // Check if product was created/updated
            const product = await Product_1.Product.findOne({
                where: { shopify_product_id: String(webhookPayload.id) }
            });
            res.json({
                success: true,
                message: "Product webhook test completed",
                data: {
                    webhook_payload: {
                        id: webhookPayload.id,
                        title: webhookPayload.title,
                        webhook_type: webhookPayload.webhook_type
                    },
                    processing_result: {
                        product_found: !!product,
                        product_data: product ? {
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            shopify_product_id: product.shopify_product_id,
                            status: product.status
                        } : null
                    }
                }
            });
        }
        catch (webhookError) {
            console.error("❌ Product webhook processing error:", webhookError);
            res.status(500).json({
                success: false,
                message: "Product webhook processing failed",
                error: webhookError.message,
                payload_received: {
                    id: webhookPayload.id,
                    title: webhookPayload.title,
                    webhook_type: webhookPayload.webhook_type
                }
            });
        }
    }
    catch (error) {
        console.error("Error in test product webhook:", error);
        res.status(500).json({
            success: false,
            message: "Test product webhook endpoint failed",
            error: error.message || "Unknown error"
        });
    }
});
/**
 * @route   GET /products/debug/count
 * @desc    Get count of products in database for debugging
 * @access  Public
 */
router.get("/debug/count", async (req, res) => {
    try {
        const count = await Product_1.Product.count();
        const products = await Product_1.Product.findAll({
            limit: 5,
            order: [['id', 'DESC']]
        });
        res.json({
            success: true,
            message: "Product count retrieved",
            data: {
                total_products: count,
                recent_products: products.map(p => ({
                    id: p.id,
                    title: p.title,
                    shopify_product_id: p.shopify_product_id,
                    price: p.price,
                    status: p.status
                }))
            }
        });
    }
    catch (error) {
        console.error("Error getting product count:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get product count",
            error: error.message
        });
    }
});
exports.default = router;
