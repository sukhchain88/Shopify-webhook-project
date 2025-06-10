"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebhook = exports.validateProduct = exports.webhookSchema = void 0;
const zod_1 = require("zod");
const productSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().nullable().optional(),
    price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    shopify_product_id: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "draft", "archived"]).default("active"),
    metadata: zod_1.z.object({
        vendor: zod_1.z.string().nullable().optional(),
        product_type: zod_1.z.string().nullable().optional(),
        tags: zod_1.z.string().nullable().optional()
    }).optional()
});
exports.webhookSchema = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    title: zod_1.z.string(),
    body_html: zod_1.z.string().nullable().optional(),
    vendor: zod_1.z.string().nullable().optional(),
    product_type: zod_1.z.string().nullable().optional(),
    tags: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(["active", "draft", "archived"]).default("active"),
    variants: zod_1.z.array(zod_1.z.object({
        price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
        sku: zod_1.z.string().nullable().optional(),
        inventory_quantity: zod_1.z.number().nullable().optional(),
    })).min(1, "At least one variant is required")
});
const validateProduct = (data) => productSchema.safeParse(data);
exports.validateProduct = validateProduct;
const validateWebhook = (data) => exports.webhookSchema.safeParse(data);
exports.validateWebhook = validateWebhook;
