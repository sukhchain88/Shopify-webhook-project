"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateShopifyOrderWebhook = exports.validateOrder = exports.orderSchema = exports.shopifyOrderWebhookSchema = void 0;
const zod_1 = require("zod");
// Schema for Shopify order webhook data (real format from Shopify)
exports.shopifyOrderWebhookSchema = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    order_number: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => String(val)), // Convert to string
    total_price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(num) ? 0 : num;
    }), // Convert to number
    currency: zod_1.z.string().default("USD"),
    financial_status: zod_1.z.string().optional(),
    fulfillment_status: zod_1.z.string().nullable().optional(),
    email: zod_1.z.string().nullable().optional(),
    created_at: zod_1.z.string().optional(),
    updated_at: zod_1.z.string().optional(),
    shop_domain: zod_1.z.string().optional(),
    // Customer can be null or an object
    customer: zod_1.z.object({
        id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        email: zod_1.z.string().nullable().optional(),
        first_name: zod_1.z.string().nullable().optional(),
        last_name: zod_1.z.string().nullable().optional(),
        phone: zod_1.z.string().nullable().optional(), // Can be null
        default_address: zod_1.z.object({
            address1: zod_1.z.string().nullable().optional(),
            address2: zod_1.z.string().nullable().optional(),
            city: zod_1.z.string().nullable().optional(),
            province: zod_1.z.string().nullable().optional(),
            country: zod_1.z.string().nullable().optional(),
            zip: zod_1.z.string().nullable().optional(),
        }).nullable().optional()
    }).nullable().optional(),
    // Line items array
    line_items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable().optional(),
        product_id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable().optional(), // Allow null product_id
        variant_id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable().optional(),
        title: zod_1.z.string().nullable().optional(), // Allow null title
        quantity: zod_1.z.number().optional(),
        price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).nullable().transform(val => {
            if (val === null || val === undefined)
                return 0;
            const num = typeof val === 'string' ? parseFloat(val) : val;
            return isNaN(num) ? 0 : num;
        }),
        sku: zod_1.z.string().nullable().optional(),
    })).optional(),
    // Billing and shipping addresses
    billing_address: zod_1.z.object({
        address1: zod_1.z.string().nullable().optional(),
        address2: zod_1.z.string().nullable().optional(),
        city: zod_1.z.string().nullable().optional(),
        province: zod_1.z.string().nullable().optional(),
        country: zod_1.z.string().nullable().optional(),
        zip: zod_1.z.string().nullable().optional(),
    }).nullable().optional(),
    shipping_address: zod_1.z.object({
        address1: zod_1.z.string().nullable().optional(),
        address2: zod_1.z.string().nullable().optional(),
        city: zod_1.z.string().nullable().optional(),
        province: zod_1.z.string().nullable().optional(),
        country: zod_1.z.string().nullable().optional(),
        zip: zod_1.z.string().nullable().optional(),
    }).nullable().optional(),
    // Additional Shopify fields that might be present
    subtotal_price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    total_tax: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    taxes_included: zod_1.z.boolean().optional(),
    total_discounts: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    total_line_items_price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    // Allow additional fields that Shopify might send
}).passthrough(); // Allow additional fields
// Original schema for API endpoints (stricter validation)
exports.orderSchema = zod_1.z.object({
    shop_domain: zod_1.z.string({
        required_error: "Shop domain is required",
        invalid_type_error: "Shop domain must be a string"
    }).min(1, "Shop domain cannot be empty"),
    order_number: zod_1.z.string({
        required_error: "Order number is required",
        invalid_type_error: "Order number must be a string"
    }).min(1, "Order number cannot be empty"),
    customer_id: zod_1.z.number({
        invalid_type_error: "Customer ID must be a number"
    }).optional(),
    total_price: zod_1.z.number({
        required_error: "Total price is required",
        invalid_type_error: "Total price must be a number"
    }).min(0, "Total price must be greater than or equal to 0"),
    currency: zod_1.z.string({
        invalid_type_error: "Currency must be a string"
    }).default("USD"),
    status: zod_1.z.enum(["pending", "paid", "fulfilled", "refunded", "cancelled"], {
        errorMap: () => ({ message: "Status must be one of: pending, paid, fulfilled, refunded, cancelled" })
    }).default("pending"),
    shopify_order_id: zod_1.z.string({
        invalid_type_error: "Shopify order ID must be a string"
    }).optional(),
    line_items: zod_1.z.array(zod_1.z.object({
        quantity: zod_1.z.number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number"
        }).int("Quantity must be an integer").positive("Quantity must be positive"),
        price: zod_1.z.union([
            zod_1.z.string({
                invalid_type_error: "Price must be a string or number"
            }).regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal number"),
            zod_1.z.number({
                invalid_type_error: "Price must be a string or number"
            }).min(0, "Price must be greater than or equal to 0")
        ]),
        title: zod_1.z.string({
            required_error: "Product title is required",
            invalid_type_error: "Product title must be a string"
        }).min(1, "Product title cannot be empty")
    })).min(1, "At least one line item is required"),
    customer: zod_1.z.object({
        email: zod_1.z.string({
            required_error: "Customer email is required",
            invalid_type_error: "Customer email must be a string"
        }).email("Invalid email address"),
        first_name: zod_1.z.string({
            invalid_type_error: "First name must be a string"
        }).optional(),
        last_name: zod_1.z.string({
            invalid_type_error: "Last name must be a string"
        }).optional(),
        phone: zod_1.z.string({
            invalid_type_error: "Phone must be a string"
        }).optional(),
        address: zod_1.z.object({
            address1: zod_1.z.string({
                invalid_type_error: "Address line 1 must be a string"
            }).optional(),
            city: zod_1.z.string({
                invalid_type_error: "City must be a string"
            }).optional(),
            province: zod_1.z.string({
                invalid_type_error: "Province must be a string"
            }).optional(),
            country: zod_1.z.string({
                invalid_type_error: "Country must be a string"
            }).optional(),
            zip: zod_1.z.string({
                invalid_type_error: "ZIP code must be a string"
            }).optional()
        }).optional()
    })
});
const validateOrder = (data) => {
    return exports.orderSchema.safeParse(data);
};
exports.validateOrder = validateOrder;
const validateShopifyOrderWebhook = (data) => {
    return exports.shopifyOrderWebhookSchema.safeParse(data);
};
exports.validateShopifyOrderWebhook = validateShopifyOrderWebhook;
