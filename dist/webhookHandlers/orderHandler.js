"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOrderWebhook = handleOrderWebhook;
const Customer_1 = require("../models/Customer");
const Order_1 = require("../models/Order");
const OrderItemService_1 = require("../services/OrderItemService");
async function handleOrderWebhook(payload) {
    try {
        // Convert Shopify order ID to string
        const shopifyOrderId = String(payload.id);
        console.log(`Processing order webhook for Shopify ID: ${shopifyOrderId}`);
        console.log('Full webhook payload:', JSON.stringify(payload, null, 2));
        const shopDomain = payload.shop_domain;
        console.log('Shop domain from payload:', shopDomain);
        if (!shopDomain) {
            throw new Error("shop_domain is required in the webhook payload");
        }
        // Extract customer data from the webhook payload
        const customerData = {
            first_name: payload.customer?.first_name,
            last_name: payload.customer?.last_name,
            email: payload.customer?.email,
            phone: payload.customer?.phone,
            shopify_customer_id: String(payload.customer?.id),
            shop_domain: shopDomain // Always include shop_domain
        };
        console.log('Customer data to create/update:', customerData);
        // Extract order data from the webhook payload
        const orderData = {
            shop_domain: shopDomain,
            order_number: payload.order_number || payload.name,
            total_price: parseFloat(String(payload.total_price)) || 0,
            currency: payload.currency,
            status: payload.financial_status,
            shopify_order_id: shopifyOrderId,
        };
        console.log('Order data to create/update:', orderData);
        // Handle customer creation/update only if email is provided
        let customer = null;
        if (customerData.email) {
            console.log('Processing customer with email:', customerData.email);
            // Find customer by Shopify ID and shop domain
            customer = await Customer_1.Customer.findOne({
                where: {
                    shopify_customer_id: customerData.shopify_customer_id,
                    shop_domain: shopDomain
                }
            }); // Type assertion to avoid linter errors
            console.log('Found existing customer by Shopify ID:', customer ? true : false);
            if (customer) {
                // Update existing customer with latest data
                await customer.update(customerData);
                console.log(`✅ Updated customer in database: ${customerData.email}`);
            }
            else {
                // Try to find customer by email and shop domain
                customer = await Customer_1.Customer.findOne({
                    where: {
                        email: customerData.email,
                        shop_domain: shopDomain
                    }
                }); // Type assertion to avoid linter errors
                console.log('Found existing customer by email:', customer ? true : false);
                if (customer) {
                    // Update existing customer with Shopify ID and other data
                    await customer.update(customerData);
                    console.log(`✅ Updated existing customer with Shopify ID: ${customerData.email}`);
                }
                else {
                    // Create new customer
                    console.log('Creating new customer with data:', customerData);
                    customer = await Customer_1.Customer.create(customerData);
                    console.log(`✅ Created new customer in database: ${customerData.email}`);
                }
            }
        }
        else {
            console.log('⚠️ No customer email provided - creating order without customer link');
        }
        // Check if order exists
        let order = await Order_1.Order.findOne({
            where: {
                shopify_order_id: shopifyOrderId,
                shop_domain: shopDomain
            }
        }); // Type assertion to avoid linter errors
        if (order) {
            // Update existing order
            await order.update({
                ...orderData,
                customer_id: customer?.id
            });
            console.log(`✅ Updated order in database: ${orderData.order_number} (ID: ${shopifyOrderId})`);
        }
        else {
            // Create new order
            order = await Order_1.Order.create({
                ...orderData,
                customer_id: customer?.id
            }); // Type assertion to avoid linter errors
            console.log(`✅ Created new order in database: ${orderData.order_number} (ID: ${shopifyOrderId})`);
        }
        // ========================================
        // NEW: Process Line Items (Order-Product Relationships)
        // ========================================
        if (payload.line_items && Array.isArray(payload.line_items) && payload.line_items.length > 0) {
            console.log(`📦 Processing ${payload.line_items.length} line items for order ${order.id}`);
            try {
                // Create order items from webhook line items
                const orderItems = await OrderItemService_1.OrderItemService.createOrderItemsFromWebhook(order.id, payload.line_items);
                console.log(`✅ Successfully created ${orderItems.length} order items`);
                // Log summary of products in this order
                const productSummary = orderItems.map(item => ({
                    title: item.product_title,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total: item.total_price
                }));
                console.log('📋 Order items summary:', JSON.stringify(productSummary, null, 2));
            }
            catch (lineItemError) {
                console.error('❌ Error processing line items:', lineItemError);
                // Don't throw error - order was created successfully, just line items failed
                console.log('⚠️ Order created but line items processing failed');
            }
        }
        else {
            console.log('⚠️ No line items found in webhook payload');
        }
    }
    catch (error) {
        console.error("Error handling order webhook:", error);
        throw error;
    }
}
