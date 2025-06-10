import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { OrderItemService } from "../services/OrderItemService.js";
export async function handleOrderWebhook(payload) {
    try {
        const shopifyOrderId = String(payload.id);
        console.log(`Processing order webhook for Shopify ID: ${shopifyOrderId}`);
        console.log('Full webhook payload:', JSON.stringify(payload, null, 2));
        const shopDomain = payload.shop_domain;
        console.log('Shop domain from payload:', shopDomain);
        if (!shopDomain) {
            throw new Error("shop_domain is required in the webhook payload");
        }
        const customerData = {
            first_name: payload.customer?.first_name,
            last_name: payload.customer?.last_name,
            email: payload.customer?.email,
            phone: payload.customer?.phone,
            shopify_customer_id: String(payload.customer?.id),
            shop_domain: shopDomain
        };
        console.log('Customer data to create/update:', customerData);
        const orderData = {
            shop_domain: shopDomain,
            order_number: payload.order_number || payload.name,
            total_price: parseFloat(String(payload.total_price)) || 0,
            currency: payload.currency,
            status: payload.financial_status,
            shopify_order_id: shopifyOrderId,
        };
        console.log('Order data to create/update:', orderData);
        let customer = null;
        if (customerData.email) {
            console.log('Processing customer with email:', customerData.email);
            customer = await Customer.findOne({
                where: {
                    shopify_customer_id: customerData.shopify_customer_id,
                    shop_domain: shopDomain
                }
            });
            console.log('Found existing customer by Shopify ID:', customer ? true : false);
            if (customer) {
                await customer.update(customerData);
                console.log(`✅ Updated customer in database: ${customerData.email}`);
            }
            else {
                customer = await Customer.findOne({
                    where: {
                        email: customerData.email,
                        shop_domain: shopDomain
                    }
                });
                console.log('Found existing customer by email:', customer ? true : false);
                if (customer) {
                    await customer.update(customerData);
                    console.log(`✅ Updated existing customer with Shopify ID: ${customerData.email}`);
                }
                else {
                    console.log('Creating new customer with data:', customerData);
                    customer = await Customer.create(customerData);
                    console.log(`✅ Created new customer in database: ${customerData.email}`);
                }
            }
        }
        else {
            console.log('⚠️ No customer email provided - creating order without customer link');
        }
        let order = await Order.findOne({
            where: {
                shopify_order_id: shopifyOrderId,
                shop_domain: shopDomain
            }
        });
        if (order) {
            await order.update({
                ...orderData,
                customer_id: customer?.id
            });
            console.log(`✅ Updated order in database: ${orderData.order_number} (ID: ${shopifyOrderId})`);
        }
        else {
            order = await Order.create({
                ...orderData,
                customer_id: customer?.id
            });
            console.log(`✅ Created new order in database: ${orderData.order_number} (ID: ${shopifyOrderId})`);
        }
        if (payload.line_items && Array.isArray(payload.line_items) && payload.line_items.length > 0) {
            console.log(`📦 Processing ${payload.line_items.length} line items for order ${order.id}`);
            try {
                const orderItems = await OrderItemService.createOrderItemsFromWebhook(order.id, payload.line_items);
                console.log(`✅ Successfully created ${orderItems.length} order items`);
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
