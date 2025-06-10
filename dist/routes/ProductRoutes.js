import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, } from "../controllers/ProductController.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { handleProductWebhook } from "../webhookHandlers/productHandler.js";
import { Product } from "../models/Product.js";
const router = express.Router();
router.get("/", asyncHandler(getAllProducts));
router.get("/:id", asyncHandler(getProductById));
router.post("/", asyncHandler(createProduct));
router.put("/:id", asyncHandler(updateProduct));
router.delete("/:id", asyncHandler(deleteProduct));
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
            await handleProductWebhook(webhookPayload);
            const product = await Product.findOne({
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
        const count = await Product.count();
        const products = await Product.findAll({
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
export default router;
