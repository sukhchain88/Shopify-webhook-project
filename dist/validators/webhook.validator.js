"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebhookPayload = void 0;
const zod_1 = require("zod");
const order_validator_js_1 = require("./order.validator.js");
const customer_validator_js_1 = require("./customer.validator.js");
const product_validator_js_1 = require("./product.validator.js");
// Base webhook schema with common fields
const webhookBaseSchema = zod_1.z.object({
    id: zod_1.z.number().or(zod_1.z.string()),
    shop_domain: zod_1.z.string().min(1, "Shop domain is required")
});
// Product delete webhook schema (minimal fields)
const productDeleteWebhookSchema = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    shop_domain: zod_1.z.string().min(1, "Shop domain is required"),
    title: zod_1.z.string().optional(), // Optional for delete webhooks
    handle: zod_1.z.string().optional(),
    vendor: zod_1.z.string().nullable().optional(),
    product_type: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(["active", "draft", "archived"]).optional(),
    tags: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().optional(),
    updated_at: zod_1.z.string().optional()
});
// Customer delete webhook schema (minimal fields)
const customerDeleteWebhookSchema = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    shop_domain: zod_1.z.string().min(1, "Shop domain is required"),
    first_name: zod_1.z.string().nullable().optional(),
    last_name: zod_1.z.string().nullable().optional(),
    email: zod_1.z.string().nullable().optional(),
    phone: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().optional(),
    updated_at: zod_1.z.string().optional()
});
// Order delete webhook schema (minimal fields)
const orderDeleteWebhookSchema = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    shop_domain: zod_1.z.string().min(1, "Shop domain is required"),
    order_number: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().optional(),
    updated_at: zod_1.z.string().optional(),
    cancelled_at: zod_1.z.string().nullable().optional()
});
// Webhook types
const WebhookType = zod_1.z.enum([
    "customers/create",
    "customers/update",
    "customers/delete",
    "orders/create",
    "orders/update",
    "orders/delete",
    "products/create",
    "products/update",
    "products/delete"
]);
// Enhanced webhook payload validator
const validateWebhookPayload = (topic, data) => {
    console.log(`🔍 Validating webhook payload for topic: ${topic}`);
    // First validate the base schema
    const baseResult = webhookBaseSchema.safeParse(data);
    if (!baseResult.success) {
        console.log("❌ Base webhook validation failed:", baseResult.error.errors);
        return baseResult;
    }
    // Then validate based on specific topic
    switch (topic) {
        // Customer webhooks
        case 'customers/create':
        case 'customers/update':
            console.log("✅ Using customer schema for create/update");
            return customer_validator_js_1.customerSchema.safeParse(data);
        case 'customers/delete':
            console.log("✅ Using customer delete schema");
            return customerDeleteWebhookSchema.safeParse(data);
        // Product webhooks  
        case 'products/create':
        case 'products/update':
            console.log("✅ Using product schema for create/update");
            return product_validator_js_1.webhookSchema.safeParse(data);
        case 'products/delete':
            console.log("✅ Using product delete schema");
            return productDeleteWebhookSchema.safeParse(data);
        // Order webhooks
        case 'orders/create':
        case 'orders/update':
            console.log("✅ Using order schema for create/update");
            return (0, order_validator_js_1.validateShopifyOrderWebhook)(data);
        case 'orders/delete':
            console.log("✅ Using order delete schema");
            return orderDeleteWebhookSchema.safeParse(data);
        // Fallback for other topics
        default:
            console.log(`⚠️ Using base schema for unknown topic: ${topic}`);
            return baseResult;
    }
};
exports.validateWebhookPayload = validateWebhookPayload;
