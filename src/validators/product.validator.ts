// src\validators\product.validator.ts
import { z } from "zod";

// Base schema for product data
const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  price: z.union([z.string(), z.number()]),
  shopify_product_id: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  metadata: z.object({
    vendor: z.string().nullable().optional(),
    product_type: z.string().nullable().optional(),
    tags: z.string().nullable().optional()
  }).optional()
});

// Schema for incoming Shopify webhook data
export const webhookSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  body_html: z.string().nullable().optional(),
  vendor: z.string().nullable().optional(),
  product_type: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  variants: z.array(z.object({
    price: z.union([z.string(), z.number()]),
    sku: z.string().nullable().optional(),
    inventory_quantity: z.number().nullable().optional(),
  })).min(1, "At least one variant is required")
});

export const validateProduct = (data: unknown) => productSchema.safeParse(data);
export const validateWebhook = (data: unknown) => webhookSchema.safeParse(data);

export type Product = z.infer<typeof productSchema>;
export type ProductWebhook = z.infer<typeof webhookSchema>;
