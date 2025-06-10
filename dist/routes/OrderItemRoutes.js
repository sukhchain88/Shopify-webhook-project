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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const OrderItemService_1 = require("../services/OrderItemService");
const Order_1 = require("../models/Order");
const OrderItem_1 = require("../models/OrderItem");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
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
    }
    catch (error) {
        console.error("Error in order items root endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load order items API info",
            error: error.message || "Unknown error"
        });
    }
});
router.get("/order/:orderId", async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        if (isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }
        const orderItems = await OrderItemService_1.OrderItemService.getOrderItems(orderId);
        return res.json({
            success: true,
            data: orderItems,
            count: orderItems.length
        });
    }
    catch (error) {
        console.error("Error fetching order items:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order items",
            error: error.message || "Unknown error"
        });
    }
});
router.get("/orders-with-items", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const orders = await OrderItemService_1.OrderItemService.getOrdersWithItems(limit, offset);
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
    }
    catch (error) {
        console.error("Error fetching orders with items:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders with items",
            error: error.message || "Unknown error"
        });
    }
});
router.get("/customer/:customerId/history", async (req, res) => {
    try {
        const customerId = parseInt(req.params.customerId);
        if (isNaN(customerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID"
            });
        }
        const purchaseHistory = await OrderItemService_1.OrderItemService.getCustomerPurchaseHistory(customerId);
        return res.json({
            success: true,
            data: purchaseHistory,
            count: purchaseHistory.length
        });
    }
    catch (error) {
        console.error("Error fetching customer purchase history:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer purchase history",
            error: error.message || "Unknown error"
        });
    }
});
router.get("/analytics/product/:productId?", async (req, res) => {
    try {
        const productId = req.params.productId ? parseInt(req.params.productId) : undefined;
        if (req.params.productId && isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }
        const analytics = await OrderItemService_1.OrderItemService.getProductSalesAnalytics(productId);
        return res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("Error fetching product analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product analytics",
            error: error.message || "Unknown error"
        });
    }
});
router.get("/search", async (req, res) => {
    try {
        const searchTerm = req.query.q;
        const limit = parseInt(req.query.limit) || 50;
        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: "Search term (q) is required"
            });
        }
        const orderItems = await OrderItemService_1.OrderItemService.searchOrderItems(searchTerm, limit);
        return res.json({
            success: true,
            data: orderItems,
            count: orderItems.length,
            search_term: searchTerm
        });
    }
    catch (error) {
        console.error("Error searching order items:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search order items",
            error: error.message || "Unknown error"
        });
    }
});
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
        const updatedItem = await OrderItemService_1.OrderItemService.updateOrderItem(itemId, updateData);
        return res.json({
            success: true,
            message: "Order item updated successfully",
            data: updatedItem
        });
    }
    catch (error) {
        console.error("Error updating order item:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update order item",
            error: error.message || "Unknown error"
        });
    }
});
router.delete("/:itemId", async (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId);
        if (isNaN(itemId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid item ID"
            });
        }
        const result = await OrderItemService_1.OrderItemService.deleteOrderItem(itemId);
        return res.json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        console.error("Error deleting order item:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete order item",
            error: error.message || "Unknown error"
        });
    }
});
router.post("/debug-webhook", async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "orderId is required"
            });
        }
        const order = await Order_1.Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: `Order ${orderId} not found`
            });
        }
        const existingItems = await OrderItem_1.OrderItem.findAll({
            where: { order_id: orderId }
        });
        const mockLineItems = [
            {
                id: 1,
                product_id: null,
                variant_id: null,
                title: "Debug Test Product",
                quantity: 1,
                price: order.total_price || 50.00,
                sku: "DEBUG-SKU-001"
            }
        ];
        const result = await OrderItemService_1.OrderItemService.createOrderItemsFromWebhook(orderId, mockLineItems);
        return res.json({
            success: true,
            message: "Debug webhook simulation completed",
            data: {
                order_id: orderId,
                order_total: order.total_price,
                existing_items_count: existingItems.length,
                created_items_count: result.length,
                created_items: result
            }
        });
    }
    catch (error) {
        console.error("Error in debug webhook:", error);
        return res.status(500).json({
            success: false,
            message: "Debug webhook failed",
            error: error.message || "Unknown error"
        });
    }
});
router.post("/create-missing", async (req, res) => {
    try {
        const result = await OrderItemService_1.OrderItemService.createMissingOrderItems();
        return res.json({
            success: true,
            message: result.message,
            data: {
                created_count: result.count,
                total_orders_processed: result.total_orders_processed
            }
        });
    }
    catch (error) {
        console.error("Error creating missing order items:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create missing order items",
            error: error.message || "Unknown error"
        });
    }
});
router.post("/test-webhook", async (req, res) => {
    try {
        const webhookPayload = req.body;
        console.log("🧪 Raw request body:", JSON.stringify(req.body, null, 2));
        console.log("🧪 Request headers:", req.headers);
        console.log("🧪 Content-Type:", req.headers['content-type']);
        if (!webhookPayload || typeof webhookPayload !== 'object') {
            return res.status(400).json({
                success: false,
                message: "Request body is empty or invalid",
                received_body: webhookPayload,
                body_type: typeof webhookPayload
            });
        }
        console.log("🧪 Payload fields:", Object.keys(webhookPayload));
        console.log("🧪 ID field:", webhookPayload.id, "Type:", typeof webhookPayload.id);
        console.log("🧪 Order number field:", webhookPayload.order_number, "Type:", typeof webhookPayload.order_number);
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
        if (!webhookPayload.shop_domain) {
            webhookPayload.shop_domain = "test-shop.myshopify.com";
        }
        console.log("🧪 Testing webhook payload:", JSON.stringify(webhookPayload, null, 2));
        try {
            const { handleOrderWebhook } = await Promise.resolve().then(() => __importStar(require("../webhookHandlers/orderHandler")));
            await handleOrderWebhook(webhookPayload);
            const createdOrder = await Order_1.Order.findOne({
                where: {
                    shopify_order_id: webhookPayload.id.toString(),
                    shop_domain: webhookPayload.shop_domain
                }
            });
            let orderItems = [];
            if (createdOrder) {
                orderItems = await OrderItem_1.OrderItem.findAll({
                    where: { order_id: createdOrder.id },
                    include: [
                        {
                            model: Order_1.Order,
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
                        order_id: createdOrder ? createdOrder.id : null,
                        order_items_created: orderItems.length,
                        order_items: orderItems.map(item => ({
                            id: item.id,
                            product_title: item.product_title,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            total_price: item.total_price,
                            shopify_product_id: item.shopify_product_id
                        }))
                    }
                }
            });
        }
        catch (webhookError) {
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
    }
    catch (error) {
        console.error("Error in test webhook:", error);
        return res.status(500).json({
            success: false,
            message: "Test webhook endpoint failed",
            error: error.message || "Unknown error"
        });
    }
});
router.post("/echo", async (req, res) => {
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
    }
    catch (error) {
        console.error("Echo endpoint error:", error);
        return res.status(500).json({
            success: false,
            message: "Echo endpoint failed",
            error: error.message
        });
    }
});
exports.default = router;
