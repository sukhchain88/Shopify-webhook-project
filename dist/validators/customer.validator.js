"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCustomerUpdateApiInput = exports.validateCustomerApiInput = exports.validateCustomerInput = exports.customerUpdateApiSchema = exports.customerApiSchema = exports.customerSchema = void 0;
const zod_1 = require("zod");
exports.customerSchema = zod_1.z.object({
    shop_domain: zod_1.z.string({
        required_error: "Shop domain is required",
        invalid_type_error: "Shop domain must be a string"
    }),
    first_name: zod_1.z.string().nullable().optional(),
    last_name: zod_1.z.string().nullable().optional(),
    email: zod_1.z.string().nullable().optional(),
    phone: zod_1.z.string().nullable().optional(),
    shopify_customer_id: zod_1.z.string().nullable().optional(),
    address: zod_1.z.string().nullable().optional(),
    city: zod_1.z.string().nullable().optional(),
    province: zod_1.z.string().nullable().optional(),
    country: zod_1.z.string().nullable().optional(),
    zip: zod_1.z.string().nullable().optional()
});
exports.customerApiSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1, "First name is required").optional(),
    last_name: zod_1.z.string().min(1, "Last name is required").optional(),
    email: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    phone: zod_1.z.string().optional(),
    shopify_customer_id: zod_1.z.string().optional(),
    address: zod_1.z.object({
        address1: zod_1.z.string().optional(),
        address2: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        province: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        zip: zod_1.z.string().optional()
    }).optional(),
    metadata: zod_1.z.object({
        customer_type: zod_1.z.string().optional(),
        source: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }).optional()
});
exports.customerUpdateApiSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1, "First name cannot be empty").optional(),
    last_name: zod_1.z.string().min(1, "Last name cannot be empty").optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
    phone: zod_1.z.string().optional(),
    shopify_customer_id: zod_1.z.string().optional(),
    address: zod_1.z.object({
        address1: zod_1.z.string().optional(),
        address2: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        province: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        zip: zod_1.z.string().optional()
    }).optional(),
    metadata: zod_1.z.object({
        customer_type: zod_1.z.string().optional(),
        source: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    }).optional()
});
const validateCustomerInput = (data) => {
    return exports.customerSchema.safeParse(data);
};
exports.validateCustomerInput = validateCustomerInput;
const validateCustomerApiInput = (data) => {
    return exports.customerApiSchema.safeParse(data);
};
exports.validateCustomerApiInput = validateCustomerApiInput;
const validateCustomerUpdateApiInput = (data) => {
    return exports.customerUpdateApiSchema.safeParse(data);
};
exports.validateCustomerUpdateApiInput = validateCustomerUpdateApiInput;
