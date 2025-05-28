import { z } from "zod";

// Schema for webhook data (includes shop_domain)
export const customerSchema = z.object({
  shop_domain: z.string({
    required_error: "Shop domain is required",
    invalid_type_error: "Shop domain must be a string"
  }),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  email: z.string().nullable().optional(), // Allow null/invalid emails for webhooks
  phone: z.string().nullable().optional(), // Allow null phone numbers
  shopify_customer_id: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  zip: z.string().nullable().optional()
});

// Schema for API endpoints (no shop_domain required, address as object)
export const customerApiSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  phone: z.string().optional(),
  shopify_customer_id: z.string().optional(),
  address: z.object({
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    zip: z.string().optional()
  }).optional(),
  metadata: z.object({
    customer_type: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional()
  }).optional()
});

// Schema for updating customers (all fields optional except email validation when provided)
export const customerUpdateApiSchema = z.object({
  first_name: z.string().min(1, "First name cannot be empty").optional(),
  last_name: z.string().min(1, "Last name cannot be empty").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  shopify_customer_id: z.string().optional(),
  address: z.object({
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    zip: z.string().optional()
  }).optional(),
  metadata: z.object({
    customer_type: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional()
  }).optional()
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerApiInput = z.infer<typeof customerApiSchema>;
export type CustomerUpdateApiInput = z.infer<typeof customerUpdateApiSchema>;

export const validateCustomerInput = (data: unknown) => {
  return customerSchema.safeParse(data);
};

export const validateCustomerApiInput = (data: unknown) => {
  return customerApiSchema.safeParse(data);
};

export const validateCustomerUpdateApiInput = (data: unknown) => {
  return customerUpdateApiSchema.safeParse(data);
}; 