import { CustomerService } from "../services/CustomerService";
import { CustomerInput } from "../validators/customer.validator";
import { Customer } from "../models";

export const handleCustomerWebhook = async (payload: any) => {
  try {
    console.log("🔍 Received customer webhook topic:", payload.webhook_type);
    console.log("📦 Raw customer webhook payload:", JSON.stringify(payload, null, 2));

    // Ensure we have at least the ID (email can be null for some customers)
    if (!payload.id) {
      console.error("❌ Missing required customer ID:", {
        hasEmail: Boolean(payload.email),
        hasId: Boolean(payload.id),
        payload: payload
      });
      throw new Error("Missing required customer data: id");
    }
    
    // Log warning if no email but continue processing
    if (!payload.email) {
      console.log("⚠️ Customer has no email - processing as guest customer");
    }

    const customerData: CustomerInput = {
      shop_domain: payload.shop_domain,
      email: payload.email || null, // Allow null email
      first_name: payload.first_name || null,
      last_name: payload.last_name || null,
      phone: payload.phone || null, // Allow null phone
      shopify_customer_id: String(payload.id),
      address: payload.default_address?.address1 || null,
      city: payload.default_address?.city || null,
      province: payload.default_address?.province || null,
      country: payload.default_address?.country || null,
      zip: payload.default_address?.zip || null
    };

    console.log("🔄 Processing customer data:", customerData);

    // Extract the base topic (e.g., "customers" from "customers/create")
    const baseTopic = payload.webhook_type.split('/')[0];
    const action = payload.webhook_type.split('/')[1];

    console.log(`📝 Base topic: ${baseTopic}, Action: ${action}`);

    // Handle all customer-related webhooks
    if (baseTopic === 'customers' || baseTopic === 'customers_marketing_consent') {
      // First check if customer exists
      let existingCustomer = await Customer.findOne({
        where: { shopify_customer_id: String(payload.id) }
      });

      if (action === 'create' || !existingCustomer) {
        // Create new customer if it doesn't exist
        if (existingCustomer) {
          console.log(`⚠️ Customer already exists in database: ${payload.email} (Shopify ID: ${payload.id})`);
          return;
        }

        const newCustomer = await Customer.create(customerData);
        console.log(
          `✅ Created new customer in database: ${newCustomer.email} (Shopify ID: ${newCustomer.shopify_customer_id})`
        );
      } else if (existingCustomer) {
        // Update existing customer
        const updatedCustomer = await existingCustomer.update(customerData);
        console.log(
          `✅ Updated customer in database: ${updatedCustomer.email} (ID: ${updatedCustomer.id})`
        );
      }

      // Special handling for customer deletion
      if (action === 'delete' && existingCustomer) {
        await existingCustomer.destroy();
        console.log(
          `✅ Deleted customer from database: ${existingCustomer.email} (ID: ${existingCustomer.id})`
        );
      }
    } else {
      console.log(`⚠️ Unhandled customer webhook type: ${payload.webhook_type}`);
    }

  } catch (error) {
    console.error("❌ Error handling customer webhook:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);
    throw error;
  }
}; 