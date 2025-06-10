import { Router } from "express";
import { ShopifyAdminService } from "../services/ShopifyAdminService.js";
import { ProductService } from "../services/ProductService.js";
const router = Router();
router.post("/products", async (req, res) => {
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
    }
    catch (error) {
        console.error("Error creating product in Shopify:", error);
        res.status(500).json({
            error: "Failed to create product in Shopify",
            details: error.message
        });
    }
});
router.put("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const productData = req.body;
        const result = await ProductService.updateProductInShopify(id, productData);
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
router.post("/customers", async (req, res) => {
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
    }
    catch (error) {
        console.error("Error creating customer in Shopify:", error);
        res.status(500).json({
            error: "Failed to create customer in Shopify",
            details: error.message
        });
    }
});
router.put("/customers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const customerData = req.body;
        const result = await ShopifyAdminService.updateCustomer(id, customerData);
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
router.post("/orders", async (req, res) => {
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
    }
    catch (error) {
        console.error("Error creating order in Shopify:", error);
        res.status(500).json({
            error: "Failed to create order in Shopify",
            details: error.message
        });
    }
});
router.put("/orders/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const orderData = req.body;
        const result = await ShopifyAdminService.updateOrder(id, orderData);
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
router.post("/orders/:id/cancel", async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const result = await ShopifyAdminService.cancelOrder(id, reason);
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
router.get("/orders", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const status = req.query.status || "any";
        const result = await ShopifyAdminService.getAllOrders(limit, status);
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
router.get("/customers", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const result = await ShopifyAdminService.getAllCustomers(limit);
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
router.post("/sync", async (req, res) => {
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
    }
    catch (error) {
        console.error("Error syncing data to Shopify:", error);
        res.status(500).json({
            error: "Failed to sync data to Shopify",
            details: error.message
        });
    }
});
router.post("/sync-local-products", async (req, res) => {
    try {
        const { Product } = await import("../models/Product.js");
        const localProducts = await Product.findAll();
        const results = [];
        for (const product of localProducts) {
            try {
                const productData = product.get({ plain: true });
                const result = await ProductService.syncProductToShopify(productData);
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
export default router;
