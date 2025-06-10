import { z } from "zod";
import { validateShopifyOrderWebhook } from "./order.validator";
import { customerSchema } from "./customer.validator";
import { webhookSchema } from "./product.validator";

// Base webhook schema with common fields
const webhookBaseSchema = z.object({
  id: z.number().or(z.string()),
  shop_domain: z.string().min(1, "Shop domain is required")
});

// Product delete webhook schema (minimal fields)
const productDeleteWebhookSchema = z.object({
  id: z.union([z.string(), z.number()]),
  shop_domain: z.string().min(1, "Shop domain is required"),
  title: z.string().optional(), // Optional for delete webhooks
  handle: z.string().optional(),
  vendor: z.string().nullable().optional(),
  product_type: z.string().nullable().optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
  tags: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

// Customer delete webhook schema (minimal fields)
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

// Order delete webhook schema (minimal fields)
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

// Webhook types
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

// Enhanced webhook payload validator
export const validateWebhookPayload = (topic: string, data: unknown) => {
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
      return customerSchema.safeParse(data);
    
    case 'customers/delete':
      console.log("✅ Using customer delete schema");
      return customerDeleteWebhookSchema.safeParse(data);

    // Product webhooks  
    case 'products/create':
    case 'products/update':
      console.log("✅ Using product schema for create/update");
      return webhookSchema.safeParse(data);
    
    case 'products/delete':
      console.log("✅ Using product delete schema");
      return productDeleteWebhookSchema.safeParse(data);

    // Order webhooks
    case 'orders/create':
    case 'orders/update':
      console.log("✅ Using order schema for create/update");
      return validateShopifyOrderWebhook(data);
    
    case 'orders/delete':
      console.log("✅ Using order delete schema");
      return orderDeleteWebhookSchema.safeParse(data);

    // Fallback for other topics
    default:
      console.log(`⚠️ Using base schema for unknown topic: ${topic}`);
      return baseResult;
  }
}; 