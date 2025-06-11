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

// src\routes\products.routes.ts
// src\routes\products.routes.js
import express, { RequestHandler } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController";
import { asyncHandler } from "../middleware/errorHandler";
import { handleProductWebhook } from "../webhookHandlers/productHandler";
import { Product } from "../models";

const router = express.Router();

/**
 * @route   GET /products
 * @desc    Get all products with optional pagination and filtering
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   search - Search term for product title
 * @query   status - Filter by product status (active, draft, archived)
 */
router.get("/", asyncHandler(getAllProducts) as RequestHandler);

/**
 * @route   GET /products/:id
 * @desc    Get a specific product by ID
 * @access  Public
 * @param   id - Product ID
 */
router.get("/:id", asyncHandler(getProductById) as RequestHandler);

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
router.post("/", asyncHandler(createProduct) as RequestHandler);

/**
 * @route   PUT /products/:id
 * @desc    Update an existing product
 * @access  Public (should be protected in production)
 * @param   id - Product ID
 * @body    Any product fields to update
 */
router.put("/:id", asyncHandler(updateProduct) as RequestHandler);

/**
 * @route   DELETE /products/:id
 * @desc    Delete a product
 * @access  Public (should be protected in production)
 * @param   id - Product ID
 */
router.delete("/:id", asyncHandler(deleteProduct) as RequestHandler);

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
      await handleProductWebhook(webhookPayload);
      
      // Check if product was created/updated
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
              id: (product as any).id,
              title: (product as any).title,
              price: (product as any).price,
              shopify_product_id: (product as any).shopify_product_id,
              status: (product as any).status
            } : null
          }
        }
      });

    } catch (webhookError: any) {
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

  } catch (error: any) {
    console.error("Error in test product webhook:", error);
    return res.status(500).json({
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
        recent_products: products.map((p: any) => ({
          id: p.id,
          title: p.title,
          shopify_product_id: p.shopify_product_id,
          price: p.price,
          status: p.status
        }))
      }
    });

  } catch (error: any) {
    console.error("Error getting product count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get product count",
      error: error.message
    });
  }
});

export default router;
