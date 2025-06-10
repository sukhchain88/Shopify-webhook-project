import { Customer } from "../models/Customer.js";
export const handleCustomerWebhook = async (payload) => {
    try {
        console.log("🔍 Received customer webhook topic:", payload.webhook_type);
        console.log("📦 Raw customer webhook payload:", JSON.stringify(payload, null, 2));
        if (!payload.id) {
            console.error("❌ Missing required customer ID:", {
                hasEmail: Boolean(payload.email),
                hasId: Boolean(payload.id),
                payload: payload
            });
            throw new Error("Missing required customer data: id");
        }
        if (!payload.email) {
            console.log("⚠️ Customer has no email - processing as guest customer");
        }
        const customerData = {
            shop_domain: payload.shop_domain,
            email: payload.email || null,
            first_name: payload.first_name || null,
            last_name: payload.last_name || null,
            phone: payload.phone || null,
            shopify_customer_id: String(payload.id),
            address: payload.default_address?.address1 || null,
            city: payload.default_address?.city || null,
            province: payload.default_address?.province || null,
            country: payload.default_address?.country || null,
            zip: payload.default_address?.zip || null
        };
        console.log("🔄 Processing customer data:", customerData);
        const baseTopic = payload.webhook_type.split('/')[0];
        const action = payload.webhook_type.split('/')[1];
        console.log(`📝 Base topic: ${baseTopic}, Action: ${action}`);
        if (baseTopic === 'customers' || baseTopic === 'customers_marketing_consent') {
            let existingCustomer = await Customer.findOne({
                where: { shopify_customer_id: String(payload.id) }
            });
            if (action === 'create' || !existingCustomer) {
                if (existingCustomer) {
                    console.log(`⚠️ Customer already exists in database: ${payload.email} (Shopify ID: ${payload.id})`);
                    return;
                }
                const newCustomer = await Customer.create(customerData);
                console.log(`✅ Created new customer in database: ${newCustomer.email} (Shopify ID: ${newCustomer.shopify_customer_id})`);
            }
            else if (existingCustomer) {
                const updatedCustomer = await existingCustomer.update(customerData);
                console.log(`✅ Updated customer in database: ${updatedCustomer.email} (ID: ${updatedCustomer.id})`);
            }
            if (action === 'delete' && existingCustomer) {
                await existingCustomer.destroy();
                console.log(`✅ Deleted customer from database: ${existingCustomer.email} (ID: ${existingCustomer.id})`);
            }
        }
        else {
            console.log(`⚠️ Unhandled customer webhook type: ${payload.webhook_type}`);
        }
    }
    catch (error) {
        console.error("❌ Error handling customer webhook:", error);
        console.error("Error details:", error instanceof Error ? error.message : error);
        throw error;
    }
};
