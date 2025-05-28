import { Customer } from "../models/customer.js";
import { Order } from "../models/order.js";
export async function handleOrderWebhook(payload) {
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
            customer = await Customer.findOne({
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
                customer = await Customer.findOne({
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
                    customer = await Customer.create(customerData);
                    console.log(`✅ Created new customer in database: ${customerData.email}`);
                }
            }
        }
        else {
            console.log('⚠️ No customer email provided - creating order without customer link');
        }
        // Check if order exists
        const existingOrder = await Order.findOne({
            where: {
                shopify_order_id: shopifyOrderId,
                shop_domain: shopDomain
            }
        });
        if (existingOrder) {
            // Update existing order
            await existingOrder.update({
                ...orderData,
                customer_id: customer?.id
            });
            console.log(`✅ Updated order in database: ${orderData.order_number} (ID: ${shopifyOrderId})`);
        }
        else {
            // Create new order
            await Order.create({
                ...orderData,
                customer_id: customer?.id
            });
            console.log(`✅ Created new order in database: ${orderData.order_number} (ID: ${shopifyOrderId})`);
        }
    }
    catch (error) {
        console.error("Error handling order webhook:", error);
        throw error;
    }
}
