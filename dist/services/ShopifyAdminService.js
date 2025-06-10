"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAdminService = void 0;
const ShopifyService_js_1 = require("./ShopifyService.js");
class ShopifyAdminService {
    static async createCustomer(customerData) {
        const shopifyPayload = {
            customer: {
                first_name: customerData.first_name,
                last_name: customerData.last_name,
                email: customerData.email,
                phone: customerData.phone,
                verified_email: true,
                addresses: customerData.address ? [
                    {
                        first_name: customerData.first_name,
                        last_name: customerData.last_name,
                        address1: customerData.address.address1,
                        city: customerData.address.city,
                        province: customerData.address.province,
                        country: customerData.address.country,
                        zip: customerData.address.zip,
                        phone: customerData.phone,
                    }
                ] : []
            }
        };
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("POST", "customers.json", shopifyPayload);
            console.log(`✅ Customer created in Shopify: ${response.customer.email} (ID: ${response.customer.id})`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to create customer in Shopify:", error);
            throw error;
        }
    }
    static async updateCustomer(customerId, customerData) {
        const shopifyPayload = {
            customer: customerData
        };
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("PUT", `customers/${customerId}.json`, shopifyPayload);
            console.log(`✅ Customer updated in Shopify: ${response.customer.email} (ID: ${response.customer.id})`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to update customer in Shopify:", error);
            throw error;
        }
    }
    static async getCustomer(customerId) {
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("GET", `customers/${customerId}.json`);
            console.log(`✅ Customer retrieved from Shopify: ${response.customer.email}`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to get customer from Shopify:", error);
            throw error;
        }
    }
    static async createOrder(orderData) {
        const shopifyPayload = {
            order: {
                line_items: orderData.line_items,
                customer: orderData.customer,
                billing_address: orderData.billing_address,
                shipping_address: orderData.shipping_address,
                financial_status: orderData.financial_status || "pending",
                send_receipt: false,
                send_fulfillment_receipt: false,
                note: orderData.note,
                tags: orderData.tags,
            }
        };
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("POST", "orders.json", shopifyPayload);
            console.log(`✅ Order created in Shopify: #${response.order.order_number} (ID: ${response.order.id})`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to create order in Shopify:", error);
            throw error;
        }
    }
    static async updateOrder(orderId, orderData) {
        const shopifyPayload = {
            order: orderData
        };
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("PUT", `orders/${orderId}.json`, shopifyPayload);
            console.log(`✅ Order updated in Shopify: #${response.order.order_number} (ID: ${response.order.id})`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to update order in Shopify:", error);
            throw error;
        }
    }
    static async getOrder(orderId) {
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("GET", `orders/${orderId}.json`);
            console.log(`✅ Order retrieved from Shopify: #${response.order.order_number}`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to get order from Shopify:", error);
            throw error;
        }
    }
    static async cancelOrder(orderId, reason) {
        const shopifyPayload = {
            reason: reason || "customer"
        };
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("POST", `orders/${orderId}/cancel.json`, shopifyPayload);
            console.log(`✅ Order cancelled in Shopify: #${response.order.order_number} (ID: ${response.order.id})`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to cancel order in Shopify:", error);
            throw error;
        }
    }
    static async getAllOrders(limit = 50, status = "any") {
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("GET", `orders.json?limit=${limit}&status=${status}`);
            console.log(`✅ Retrieved ${response.orders.length} orders from Shopify`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to get orders from Shopify:", error);
            throw error;
        }
    }
    static async getAllCustomers(limit = 50) {
        try {
            const response = await (0, ShopifyService_js_1.shopifyApiService)("GET", `customers.json?limit=${limit}`);
            console.log(`✅ Retrieved ${response.customers.length} customers from Shopify`);
            return response;
        }
        catch (error) {
            console.error("❌ Failed to get customers from Shopify:", error);
            throw error;
        }
    }
    static async syncDataToShopify(data) {
        const results = {
            products: [],
            customers: [],
            orders: []
        };
        try {
            if (data.products && data.products.length > 0) {
                console.log(`🔄 Syncing ${data.products.length} products to Shopify...`);
                for (const product of data.products) {
                    try {
                        const result = await this.createProductInShopify(product);
                        results.products.push(result);
                    }
                    catch (error) {
                        console.error(`❌ Failed to sync product: ${product.title}`, error);
                    }
                }
            }
            if (data.customers && data.customers.length > 0) {
                console.log(`🔄 Syncing ${data.customers.length} customers to Shopify...`);
                for (const customer of data.customers) {
                    try {
                        const result = await this.createCustomer(customer);
                        results.customers.push(result);
                    }
                    catch (error) {
                        console.error(`❌ Failed to sync customer: ${customer.email}`, error);
                    }
                }
            }
            if (data.orders && data.orders.length > 0) {
                console.log(`🔄 Syncing ${data.orders.length} orders to Shopify...`);
                for (const order of data.orders) {
                    try {
                        const result = await this.createOrder(order);
                        results.orders.push(result);
                    }
                    catch (error) {
                        console.error(`❌ Failed to sync order: ${order.order_number}`, error);
                    }
                }
            }
            console.log(`✅ Sync completed: ${results.products.length} products, ${results.customers.length} customers, ${results.orders.length} orders`);
            return results;
        }
        catch (error) {
            console.error("❌ Failed to sync data to Shopify:", error);
            throw error;
        }
    }
    static async createProductInShopify(productData) {
        const shopifyPayload = {
            product: {
                title: productData.title,
                body_html: productData.description || "",
                vendor: productData.metadata?.vendor || "",
                product_type: productData.metadata?.product_type || "",
                status: productData.status || "active",
                tags: productData.metadata?.tags || "",
                variants: [
                    {
                        price: productData.price?.toString() || "0.00",
                        inventory_quantity: 100,
                    }
                ]
            }
        };
        return await (0, ShopifyService_js_1.shopifyApiService)("POST", "products.json", shopifyPayload);
    }
}
exports.ShopifyAdminService = ShopifyAdminService;
