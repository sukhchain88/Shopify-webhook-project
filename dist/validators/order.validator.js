import { z } from "zod";
export const shopifyOrderWebhookSchema = z.object({
    id: z.union([z.string(), z.number()]),
    order_number: z.union([z.string(), z.number()]).transform(val => String(val)),
    total_price: z.union([z.string(), z.number()]).transform(val => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return isNaN(num) ? 0 : num;
    }),
    currency: z.string().default("USD"),
    financial_status: z.string().optional(),
    fulfillment_status: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    shop_domain: z.string().optional(),
    customer: z.object({
        id: z.union([z.string(), z.number()]).optional(),
        email: z.string().nullable().optional(),
        first_name: z.string().nullable().optional(),
        last_name: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        default_address: z.object({
            address1: z.string().nullable().optional(),
            address2: z.string().nullable().optional(),
            city: z.string().nullable().optional(),
            province: z.string().nullable().optional(),
            country: z.string().nullable().optional(),
            zip: z.string().nullable().optional(),
        }).nullable().optional()
    }).nullable().optional(),
    line_items: z.array(z.object({
        id: z.union([z.string(), z.number()]).nullable().optional(),
        product_id: z.union([z.string(), z.number()]).nullable().optional(),
        variant_id: z.union([z.string(), z.number()]).nullable().optional(),
        title: z.string().nullable().optional(),
        quantity: z.number().optional(),
        price: z.union([z.string(), z.number()]).nullable().transform(val => {
            if (val === null || val === undefined)
                return 0;
            const num = typeof val === 'string' ? parseFloat(val) : val;
            return isNaN(num) ? 0 : num;
        }),
        sku: z.string().nullable().optional(),
    })).optional(),
    billing_address: z.object({
        address1: z.string().nullable().optional(),
        address2: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        province: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
        zip: z.string().nullable().optional(),
    }).nullable().optional(),
    shipping_address: z.object({
        address1: z.string().nullable().optional(),
        address2: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        province: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
        zip: z.string().nullable().optional(),
    }).nullable().optional(),
    subtotal_price: z.union([z.string(), z.number()]).optional(),
    total_tax: z.union([z.string(), z.number()]).optional(),
    taxes_included: z.boolean().optional(),
    total_discounts: z.union([z.string(), z.number()]).optional(),
    total_line_items_price: z.union([z.string(), z.number()]).optional(),
}).passthrough();
export const orderSchema = z.object({
    shop_domain: z.string({
        required_error: "Shop domain is required",
        invalid_type_error: "Shop domain must be a string"
    }).min(1, "Shop domain cannot be empty"),
    order_number: z.string({
        required_error: "Order number is required",
        invalid_type_error: "Order number must be a string"
    }).min(1, "Order number cannot be empty"),
    customer_id: z.number({
        invalid_type_error: "Customer ID must be a number"
    }).optional(),
    total_price: z.number({
        required_error: "Total price is required",
        invalid_type_error: "Total price must be a number"
    }).min(0, "Total price must be greater than or equal to 0"),
    currency: z.string({
        invalid_type_error: "Currency must be a string"
    }).default("USD"),
    status: z.enum(["pending", "paid", "fulfilled", "refunded", "cancelled"], {
        errorMap: () => ({ message: "Status must be one of: pending, paid, fulfilled, refunded, cancelled" })
    }).default("pending"),
    shopify_order_id: z.string({
        invalid_type_error: "Shopify order ID must be a string"
    }).optional(),
    line_items: z.array(z.object({
        quantity: z.number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number"
        }).int("Quantity must be an integer").positive("Quantity must be positive"),
        price: z.union([
            z.string({
                invalid_type_error: "Price must be a string or number"
            }).regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal number"),
            z.number({
                invalid_type_error: "Price must be a string or number"
            }).min(0, "Price must be greater than or equal to 0")
        ]),
        title: z.string({
            required_error: "Product title is required",
            invalid_type_error: "Product title must be a string"
        }).min(1, "Product title cannot be empty")
    })).min(1, "At least one line item is required"),
    customer: z.object({
        email: z.string({
            required_error: "Customer email is required",
            invalid_type_error: "Customer email must be a string"
        }).email("Invalid email address"),
        first_name: z.string({
            invalid_type_error: "First name must be a string"
        }).optional(),
        last_name: z.string({
            invalid_type_error: "Last name must be a string"
        }).optional(),
        phone: z.string({
            invalid_type_error: "Phone must be a string"
        }).optional(),
        address: z.object({
            address1: z.string({
                invalid_type_error: "Address line 1 must be a string"
            }).optional(),
            city: z.string({
                invalid_type_error: "City must be a string"
            }).optional(),
            province: z.string({
                invalid_type_error: "Province must be a string"
            }).optional(),
            country: z.string({
                invalid_type_error: "Country must be a string"
            }).optional(),
            zip: z.string({
                invalid_type_error: "ZIP code must be a string"
            }).optional()
        }).optional()
    })
});
export const validateOrder = (data) => {
    return orderSchema.safeParse(data);
};
export const validateShopifyOrderWebhook = (data) => {
    return shopifyOrderWebhookSchema.safeParse(data);
};
