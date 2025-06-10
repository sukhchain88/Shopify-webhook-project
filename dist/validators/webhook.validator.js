import { z } from "zod";
import { validateShopifyOrderWebhook } from "./order.validator.js";
import { customerSchema } from "./customer.validator.js";
import { webhookSchema } from "./product.validator.js";
const webhookBaseSchema = z.object({
    id: z.number().or(z.string()),
    shop_domain: z.string().min(1, "Shop domain is required")
});
const productDeleteWebhookSchema = z.object({
    id: z.union([z.string(), z.number()]),
    shop_domain: z.string().min(1, "Shop domain is required"),
    title: z.string().optional(),
    handle: z.string().optional(),
    vendor: z.string().nullable().optional(),
    product_type: z.string().nullable().optional(),
    status: z.enum(["active", "draft", "archived"]).optional(),
    tags: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional()
});
const customerDeleteWebhookSchema = z.object({
    id: z.union([z.string(), z.number()]),
    shop_domain: z.string().min(1, "Shop domain is required"),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional()
});
const orderDeleteWebhookSchema = z.object({
    id: z.union([z.string(), z.number()]),
    shop_domain: z.string().min(1, "Shop domain is required"),
    order_number: z.union([z.string(), z.number()]).optional(),
    name: z.string().optional(),
    email: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    cancelled_at: z.string().nullable().optional()
});
const WebhookType = z.enum([
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
export const validateWebhookPayload = (topic, data) => {
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
            return customerSchema.safeParse(data);
        case 'customers/delete':
            console.log("✅ Using customer delete schema");
            return customerDeleteWebhookSchema.safeParse(data);
        case 'products/create':
        case 'products/update':
            console.log("✅ Using product schema for create/update");
            return webhookSchema.safeParse(data);
        case 'products/delete':
            console.log("✅ Using product delete schema");
            return productDeleteWebhookSchema.safeParse(data);
        case 'orders/create':
        case 'orders/update':
            console.log("✅ Using order schema for create/update");
            return validateShopifyOrderWebhook(data);
        case 'orders/delete':
            console.log("✅ Using order delete schema");
            return orderDeleteWebhookSchema.safeParse(data);
        default:
            console.log(`⚠️ Using base schema for unknown topic: ${topic}`);
            return baseResult;
    }
};
