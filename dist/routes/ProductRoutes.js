"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ProductController_js_1 = require("../controllers/ProductController.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const productHandler_js_1 = require("../webhookHandlers/productHandler.js");
const Product_js_1 = require("../models/Product.js");
const router = express_1.default.Router();
router.get("/", (0, errorHandler_js_1.asyncHandler)(ProductController_js_1.getAllProducts));
router.get("/:id", (0, errorHandler_js_1.asyncHandler)(ProductController_js_1.getProductById));
router.post("/", (0, errorHandler_js_1.asyncHandler)(ProductController_js_1.createProduct));
router.put("/:id", (0, errorHandler_js_1.asyncHandler)(ProductController_js_1.updateProduct));
router.delete("/:id", (0, errorHandler_js_1.asyncHandler)(ProductController_js_1.deleteProduct));
router.post("/test-webhook", async (req, res) => {
    try {
        const webhookPayload = req.body;
        console.log("🧪 Testing product webhook:", JSON.stringify(webhookPayload, null, 2));
        if (!webhookPayload || !webhookPayload.id) {
            return res.status(400).json({
                success: false,
                message: "Invalid webhook payload - missing id field",
                received: webhookPayload
            });
        }
        if (!webhookPayload.webhook_type) {
            webhookPayload.webhook_type = 'products/create';
        }
        try {
            await (0, productHandler_js_1.handleProductWebhook)(webhookPayload);
            const product = await Product_js_1.Product.findOne({
                where: { shopify_product_id: String(webhookPayload.id) }
            });
            return res.json({
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
            return res.status(500).json({
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
        return res.status(500).json({
            success: false,
            message: "Test product webhook endpoint failed",
            error: error.message || "Unknown error"
        });
    }
});
router.get("/debug/count", async (req, res) => {
    try {
        const count = await Product_js_1.Product.count();
        const products = await Product_js_1.Product.findAll({
            limit: 5,
            order: [['id', 'DESC']]
        });
        res.json({
            success: true,
            message: "Product count retrieved",
            data: {
                total_products: count,
                recent_products: products.map((p) => ({
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
