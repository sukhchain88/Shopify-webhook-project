"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebhookPayload = void 0;
const zod_1 = require("zod");
const order_validator_1 = require("./order.validator");
const customer_validator_1 = require("./customer.validator");
const product_validator_1 = require("./product.validator");
const webhookBaseSchema = zod_1.z.object({
    id: zod_1.z.number().or(zod_1.z.string()),
    shop_domain: zod_1.z.string().min(1, "Shop domain is required")
});
const productDeleteWebhookSchema = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    shop_domain: zod_1.z.string().min(1, "Shop domain is required"),
    title: zod_1.z.string().optional(),
    handle: zod_1.z.string().optional(),
    vendor: zod_1.z.string().nullable().optional(),
    product_type: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(["active", "draft", "archived"]).optional(),
    tags: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().optional(),
    updated_at: zod_1.z.string().optional()
});
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
const validateWebhookPayload = (topic, data) => {
    console.log(`🔍 Validating webhook payload for topic: ${topic}`);
    const baseResult = webhookBaseSchema.safeParse(data);
    if (!baseResult.success) {
        console.log("❌ Base webhook validation failed:", baseResult.error.errors);
        return baseResult;
    }
    switch (topic) {
        case 'customers/create':
        case 'customers/update':
            console.log("✅ Using customer schema for create/update");
            return customer_validator_1.customerSchema.safeParse(data);
        case 'customers/delete':
            console.log("✅ Using customer delete schema");
            return customerDeleteWebhookSchema.safeParse(data);
        case 'products/create':
        case 'products/update':
            console.log("✅ Using product schema for create/update");
            return product_validator_1.webhookSchema.safeParse(data);
        case 'products/delete':
            console.log("✅ Using product delete schema");
            return productDeleteWebhookSchema.safeParse(data);
        case 'orders/create':
        case 'orders/update':
            console.log("✅ Using order schema for create/update");
            return (0, order_validator_1.validateShopifyOrderWebhook)(data);
        case 'orders/delete':
            console.log("✅ Using order delete schema");
            return orderDeleteWebhookSchema.safeParse(data);
        default:
            console.log(`⚠️ Using base schema for unknown topic: ${topic}`);
            return baseResult;
    }
};
exports.validateWebhookPayload = validateWebhookPayload;
