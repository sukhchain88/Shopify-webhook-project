import express, { Request, Response } from "express";
import { OrderItemService } from "../services/OrderItemService";
import { Order, OrderItem } from "../models";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

/**
 * GET /api/order-items
 * Get basic info about order items endpoints
 */
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: "Order Items API",
      available_endpoints: {
        "GET /api/order-items/order/:orderId": "Get items for a specific order",
        "GET /api/order-items/orders-with-items": "Get all orders with their items",
        "GET /api/order-items/customer/:customerId/history": "Get customer purchase history",
        "GET /api/order-items/analytics/product/:productId": "Get product sales analytics",
        "GET /api/order-items/search?q=term": "Search order items",
        "PUT /api/order-items/:itemId": "Update an order item",
        "POST /api/order-items/test-webhook": "Test webhook processing"
      }
    });
    
  } catch (error: any) {
    console.error("Error in order items root endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load order items API info",
      error: error.message || "Unknown error"
    });
  }
}));

/**
 * GET /api/order-items/order/:orderId
 * Get all items for a specific order
 */
router.get("/order/:orderId", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }
    
    const orderItems = await OrderItemService.getOrderItems(orderId);
    
    return res.json({
      success: true,
      data: orderItems,
      count: orderItems.length
    });
    
  } catch (error: any) {
    console.error("Error fetching order items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order items",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * GET /api/order-items/orders-with-items
 * Get all orders with their items and products
 */
router.get("/orders-with-items", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const orders = await OrderItemService.getOrdersWithItems(limit, offset);
    
    res.json({
      success: true,
      data: orders,
      count: orders.length,
      pagination: {
        limit,
        offset,
        has_more: orders.length === limit
      }
    });
    
  } catch (error: any) {
    console.error("Error fetching orders with items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders with items",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * GET /api/order-items/customer/:customerId/history
 * Get customer purchase history with products
 */
router.get("/customer/:customerId/history", async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    
    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID"
      });
    }
    
    const purchaseHistory = await OrderItemService.getCustomerPurchaseHistory(customerId);
    
    return res.json({
      success: true,
      data: purchaseHistory,
      count: purchaseHistory.length
    });
    
  } catch (error: any) {
    console.error("Error fetching customer purchase history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer purchase history",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * GET /api/order-items/analytics/product/:productId?
 * Get product sales analytics
 */
router.get("/analytics/product/:productId?", async (req, res) => {
  try {
    const productId = req.params.productId ? parseInt(req.params.productId) : undefined;
    
    if (req.params.productId && isNaN(productId!)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }
    
    const analytics = await OrderItemService.getProductSalesAnalytics(productId);
    
    return res.json({
      success: true,
      data: analytics
    });
    
  } catch (error: any) {
    console.error("Error fetching product analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product analytics",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * GET /api/order-items/search
 * Search order items by product name or SKU
 */
router.get("/search", async (req, res) => {
  try {
    const searchTerm = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term (q) is required"
      });
    }
    
    const orderItems = await OrderItemService.searchOrderItems(searchTerm, limit);
    
    return res.json({
      success: true,
      data: orderItems,
      count: orderItems.length,
      search_term: searchTerm
    });
    
  } catch (error: any) {
    console.error("Error searching order items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search order items",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * PUT /api/order-items/:itemId
 * Update an order item
 */
router.put("/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID"
      });
    }
    
    const updateData = req.body;
    const updatedItem = await OrderItemService.updateOrderItem(itemId, updateData);
    
    return res.json({
      success: true,
      message: "Order item updated successfully",
      data: updatedItem
    });
    
  } catch (error: any) {
    console.error("Error updating order item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order item",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * DELETE /api/order-items/:itemId
 * Delete an order item
 */
router.delete("/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID"
      });
    }
    
    const result = await OrderItemService.deleteOrderItem(itemId);
    
    return res.json({
      success: true,
      message: result.message
    });
    
  } catch (error: any) {
    console.error("Error deleting order item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order item",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * POST /api/order-items/debug-webhook
 * Debug webhook processing for order items
 */
router.post("/debug-webhook", async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required"
      });
    }

    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order ${orderId} not found`
      });
    }

    // Check if order already has order items
    const existingItems = await OrderItem.findAll({
      where: { order_id: orderId }
    });

    // Simulate webhook line items creation
    const mockLineItems = [
      {
        id: 1,
        product_id: null,
        variant_id: null,
        title: "Debug Test Product",
        quantity: 1,
        price: (order as any).total_price || 50.00,
        sku: "DEBUG-SKU-001"
      }
    ];

    const result = await OrderItemService.createOrderItemsFromWebhook(orderId, mockLineItems);

    return res.json({
      success: true,
      message: "Debug webhook simulation completed",
      data: {
        order_id: orderId,
        order_total: (order as any).total_price,
        existing_items_count: existingItems.length,
        created_items_count: result.length,
        created_items: result
      }
    });

  } catch (error: any) {
    console.error("Error in debug webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Debug webhook failed",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * POST /api/order-items/create-missing
 * Create order items for existing orders that don't have any
 * This is useful for orders created before the order items feature was implemented
 */
router.post("/create-missing", async (req, res): Promise<any> => {
  try {
    const result = await OrderItemService.createMissingOrderItems();
    
    return res.json({
      success: true,
      message: result.message,
      data: {
        created_count: result.count,
        total_orders_processed: result.total_orders_processed
      }
    });
    
  } catch (error: any) {
    console.error("Error creating missing order items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create missing order items",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * POST /api/order-items/test-webhook
 * Test webhook processing with a complete order payload
 */
router.post("/test-webhook", async (req, res) => {
  try {
    const webhookPayload = req.body;
    
    // Add debugging to see what we actually received
    console.log("🧪 Raw request body:", JSON.stringify(req.body, null, 2));
    console.log("🧪 Request headers:", req.headers);
    console.log("🧪 Content-Type:", req.headers['content-type']);
    
    // Check if body is empty
    if (!webhookPayload || typeof webhookPayload !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Request body is empty or invalid",
        received_body: webhookPayload,
        body_type: typeof webhookPayload
      });
    }
    
    // More detailed validation
    console.log("🧪 Payload fields:", Object.keys(webhookPayload));
    console.log("🧪 ID field:", webhookPayload.id, "Type:", typeof webhookPayload.id);
    console.log("🧪 Order number field:", webhookPayload.order_number, "Type:", typeof webhookPayload.order_number);
    
    // Validate required fields
    if (!webhookPayload.id || !webhookPayload.order_number) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: id and order_number are required",
        received_fields: {
          id: webhookPayload.id,
          order_number: webhookPayload.order_number,
          all_fields: Object.keys(webhookPayload)
        }
      });
    }

    // Add shop_domain if missing (required for our system)
    if (!webhookPayload.shop_domain) {
      webhookPayload.shop_domain = "test-shop.myshopify.com";
    }

    console.log("🧪 Testing webhook payload:", JSON.stringify(webhookPayload, null, 2));

    try {
      // Import the order webhook handler
      const { handleOrderWebhook } = await import("../webhookHandlers/orderHandler");
      
      // Process the webhook using the actual handler
      await handleOrderWebhook(webhookPayload);
      
      // Check what was created
      const createdOrder = await Order.findOne({
        where: { 
          shopify_order_id: webhookPayload.id.toString(),
          shop_domain: webhookPayload.shop_domain 
        }
      });

      let orderItems: any[] = [];
      if (createdOrder) {
        orderItems = await OrderItem.findAll({
          where: { order_id: (createdOrder as any).id },
          include: [
            {
              model: Order,
              as: 'order'
            }
          ]
        });
      }

      return res.json({
        success: true,
        message: "Test webhook processed successfully",
        data: {
          webhook_payload: {
            shopify_order_id: webhookPayload.id,
            order_number: webhookPayload.order_number,
            total_price: webhookPayload.total_price,
            line_items_count: webhookPayload.line_items?.length || 0,
            has_customer: !!webhookPayload.customer
          },
          processing_result: {
            order_created: !!createdOrder,
            order_id: createdOrder ? (createdOrder as any).id : null,
            order_items_created: orderItems.length,
            order_items: orderItems.map(item => ({
              id: (item as any).id,
              product_title: (item as any).product_title,
              quantity: (item as any).quantity,
              unit_price: (item as any).unit_price,
              total_price: (item as any).total_price,
              shopify_product_id: (item as any).shopify_product_id
            }))
          }
        }
      });

    } catch (webhookError: any) {
      console.error("❌ Webhook processing error:", webhookError);
      
      return res.status(500).json({
        success: false,
        message: "Webhook processing failed",
        error: webhookError.message,
        payload_received: {
          shopify_order_id: webhookPayload.id,
          has_line_items: !!webhookPayload.line_items,
          line_items_count: webhookPayload.line_items?.length || 0
        }
      });
    }

  } catch (error: any) {
    console.error("Error in test webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Test webhook endpoint failed",
      error: error.message || "Unknown error"
    });
  }
});

/**
 * POST /api/order-items/echo
 * Simple endpoint to echo back the request body for debugging
 */
router.post("/echo", async (req, res): Promise<any> => {
  try {
    console.log("🔍 ECHO - Raw request body:", req.body);
    console.log("🔍 ECHO - Body type:", typeof req.body);
    console.log("🔍 ECHO - Body keys:", Object.keys(req.body || {}));
    console.log("🔍 ECHO - Headers:", req.headers);
    
    return res.json({
      success: true,
      message: "Echo test successful",
      received: {
        body: req.body,
        body_type: typeof req.body,
        body_keys: Object.keys(req.body || {}),
        content_type: req.headers['content-type'],
        body_size: JSON.stringify(req.body || {}).length
      }
    });
    
  } catch (error: any) {
    console.error("Echo endpoint error:", error);
    return res.status(500).json({
      success: false,
      message: "Echo endpoint failed",
      error: error.message
    });
  }
});

export default router; 