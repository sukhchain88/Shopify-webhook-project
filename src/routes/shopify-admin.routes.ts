import { Router, Request, Response } from "express";
import { ShopifyAdminService } from "../services/shopify-admin.service.js";
import { ProductService } from "../services/product.service.js";

const router = Router();

/**
 * POST /api/shopify-admin/products
 * Create a product in Shopify admin store
 */
router.post("/products", async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = req.body;
    
    if (!productData.title || !productData.price) {
      res.status(400).json({
        error: "Title and price are required"
      });
      return;
    }

    const result = await ProductService.createProductInShopify(productData);
    
    res.status(201).json({
      message: "Product created successfully in Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error creating product in Shopify:", error);
    res.status(500).json({
      error: "Failed to create product in Shopify",
      details: error.message
    });
  }
});

/**
 * PUT /api/shopify-admin/products/:id
 * Update a product in Shopify admin store
 */
router.put("/products/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const result = await ProductService.updateProductInShopify(id, productData);
    
    res.json({
      message: "Product updated successfully in Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error updating product in Shopify:", error);
    res.status(500).json({
      error: "Failed to update product in Shopify",
      details: error.message
    });
  }
});

/**
 * POST /api/shopify-admin/customers
 * Create a customer in Shopify admin store
 */
router.post("/customers", async (req: Request, res: Response): Promise<void> => {
  try {
    const customerData = req.body;
    
    if (!customerData.email) {
      res.status(400).json({
        error: "Email is required"
      });
      return;
    }

    const result = await ShopifyAdminService.createCustomer(customerData);
    
    res.status(201).json({
      message: "Customer created successfully in Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error creating customer in Shopify:", error);
    res.status(500).json({
      error: "Failed to create customer in Shopify",
      details: error.message
    });
  }
});

/**
 * PUT /api/shopify-admin/customers/:id
 * Update a customer in Shopify admin store
 */
router.put("/customers/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerData = req.body;

    const result = await ShopifyAdminService.updateCustomer(id, customerData);
    
    res.json({
      message: "Customer updated successfully in Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error updating customer in Shopify:", error);
    res.status(500).json({
      error: "Failed to update customer in Shopify",
      details: error.message
    });
  }
});

/**
 * POST /api/shopify-admin/orders
 * Create an order in Shopify admin store
 */
router.post("/orders", async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body;
    
    if (!orderData.line_items || !Array.isArray(orderData.line_items) || orderData.line_items.length === 0) {
      res.status(400).json({
        error: "Line items are required"
      });
      return;
    }

    const result = await ShopifyAdminService.createOrder(orderData);
    
    res.status(201).json({
      message: "Order created successfully in Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error creating order in Shopify:", error);
    res.status(500).json({
      error: "Failed to create order in Shopify",
      details: error.message
    });
  }
});

/**
 * PUT /api/shopify-admin/orders/:id
 * Update an order in Shopify admin store
 */
router.put("/orders/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const orderData = req.body;

    const result = await ShopifyAdminService.updateOrder(id, orderData);
    
    res.json({
      message: "Order updated successfully in Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error updating order in Shopify:", error);
    res.status(500).json({
      error: "Failed to update order in Shopify",
      details: error.message
    });
  }
});

/**
 * POST /api/shopify-admin/orders/:id/cancel
 * Cancel an order in Shopify admin store
 */
router.post("/orders/:id/cancel", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await ShopifyAdminService.cancelOrder(id, reason);
    
    res.json({
      message: "Order cancelled successfully in Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error cancelling order in Shopify:", error);
    res.status(500).json({
      error: "Failed to cancel order in Shopify",
      details: error.message
    });
  }
});

/**
 * GET /api/shopify-admin/orders
 * Get all orders from Shopify admin store
 */
router.get("/orders", async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string || "any";

    const result = await ShopifyAdminService.getAllOrders(limit, status);
    
    res.json({
      message: "Orders retrieved successfully from Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error getting orders from Shopify:", error);
    res.status(500).json({
      error: "Failed to get orders from Shopify",
      details: error.message
    });
  }
});

/**
 * GET /api/shopify-admin/customers
 * Get all customers from Shopify admin store
 */
router.get("/customers", async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await ShopifyAdminService.getAllCustomers(limit);
    
    res.json({
      message: "Customers retrieved successfully from Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error getting customers from Shopify:", error);
    res.status(500).json({
      error: "Failed to get customers from Shopify",
      details: error.message
    });
  }
});

/**
 * POST /api/shopify-admin/sync
 * Sync local data to Shopify admin store
 */
router.post("/sync", async (req: Request, res: Response): Promise<void> => {
  try {
    const { products, customers, orders } = req.body;

    const result = await ShopifyAdminService.syncDataToShopify({
      products,
      customers,
      orders
    });
    
    res.json({
      message: "Data synced successfully to Shopify",
      data: result
    });
  } catch (error: any) {
    console.error("Error syncing data to Shopify:", error);
    res.status(500).json({
      error: "Failed to sync data to Shopify",
      details: error.message
    });
  }
});

/**
 * POST /api/shopify-admin/sync-local-products
 * Sync all local products to Shopify admin store
 */
router.post("/sync-local-products", async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all local products
    const { Product } = await import("../models/product.js");
    const localProducts = await Product.findAll();

    const results = [];
    for (const product of localProducts) {
      try {
        const productData = product.get({ plain: true });
        const result = await ProductService.syncProductToShopify(productData);
        results.push(result);
      } catch (error) {
        console.error(`Failed to sync product ${(product as any).title}:`, error);
      }
    }
    
    res.json({
      message: `Successfully synced ${results.length} products to Shopify`,
      data: results
    });
  } catch (error: any) {
    console.error("Error syncing local products to Shopify:", error);
    res.status(500).json({
      error: "Failed to sync local products to Shopify",
      details: error.message
    });
  }
});

export default router; 