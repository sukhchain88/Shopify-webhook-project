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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShopifyAdminService_1 = require("../services/ShopifyAdminService");
const ProductService_1 = require("../services/ProductService");
const router = (0, express_1.Router)();
/**
 * POST /api/shopify-admin/products
 * Create a product in Shopify admin store
 */
router.post("/products", async (req, res) => {
    try {
        const productData = req.body;
        if (!productData.title || !productData.price) {
            res.status(400).json({
                error: "Title and price are required"
            });
            return;
        }
        const result = await ProductService_1.ProductService.createProductInShopify(productData);
        res.status(201).json({
            message: "Product created successfully in Shopify",
            data: result
        });
    }
    catch (error) {
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
router.put("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const productData = req.body;
        const result = await ProductService_1.ProductService.updateProductInShopify(id, productData);
        res.json({
            message: "Product updated successfully in Shopify",
            data: result
        });
    }
    catch (error) {
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
router.post("/customers", async (req, res) => {
    try {
        const customerData = req.body;
        if (!customerData.email) {
            res.status(400).json({
                error: "Email is required"
            });
            return;
        }
        const result = await ShopifyAdminService_1.ShopifyAdminService.createCustomer(customerData);
        res.status(201).json({
            message: "Customer created successfully in Shopify",
            data: result
        });
    }
    catch (error) {
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
router.put("/customers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const customerData = req.body;
        const result = await ShopifyAdminService_1.ShopifyAdminService.updateCustomer(id, customerData);
        res.json({
            message: "Customer updated successfully in Shopify",
            data: result
        });
    }
    catch (error) {
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
router.post("/orders", async (req, res) => {
    try {
        const orderData = req.body;
        if (!orderData.line_items || !Array.isArray(orderData.line_items) || orderData.line_items.length === 0) {
            res.status(400).json({
                error: "Line items are required"
            });
            return;
        }
        const result = await ShopifyAdminService_1.ShopifyAdminService.createOrder(orderData);
        res.status(201).json({
            message: "Order created successfully in Shopify",
            data: result
        });
    }
    catch (error) {
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
router.put("/orders/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const orderData = req.body;
        const result = await ShopifyAdminService_1.ShopifyAdminService.updateOrder(id, orderData);
        res.json({
            message: "Order updated successfully in Shopify",
            data: result
        });
    }
    catch (error) {
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
router.post("/orders/:id/cancel", async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const result = await ShopifyAdminService_1.ShopifyAdminService.cancelOrder(id, reason);
        res.json({
            message: "Order cancelled successfully in Shopify",
            data: result
        });
    }
    catch (error) {
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
router.get("/orders", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const status = req.query.status || "any";
        const result = await ShopifyAdminService_1.ShopifyAdminService.getAllOrders(limit, status);
        res.json({
            message: "Orders retrieved successfully from Shopify",
            data: result
        });
    }
    catch (error) {
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
router.get("/customers", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const result = await ShopifyAdminService_1.ShopifyAdminService.getAllCustomers(limit);
        res.json({
            message: "Customers retrieved successfully from Shopify",
            data: result
        });
    }
    catch (error) {
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
router.post("/sync", async (req, res) => {
    try {
        const { products, customers, orders } = req.body;
        const result = await ShopifyAdminService_1.ShopifyAdminService.syncDataToShopify({
            products,
            customers,
            orders
        });
        res.json({
            message: "Data synced successfully to Shopify",
            data: result
        });
    }
    catch (error) {
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
router.post("/sync-local-products", async (req, res) => {
    try {
        // Get all local products
        const { Product } = await Promise.resolve().then(() => __importStar(require("../models/Product")));
        const localProducts = await Product.findAll();
        const results = [];
        for (const product of localProducts) {
            try {
                const productData = product.get({ plain: true });
                const result = await ProductService_1.ProductService.syncProductToShopify(productData);
                results.push(result);
            }
            catch (error) {
                console.error(`Failed to sync product ${product.title}:`, error);
            }
        }
        res.json({
            message: `Successfully synced ${results.length} products to Shopify`,
            data: results
        });
    }
    catch (error) {
        console.error("Error syncing local products to Shopify:", error);
        res.status(500).json({
            error: "Failed to sync local products to Shopify",
            details: error.message
        });
    }
});
exports.default = router;
