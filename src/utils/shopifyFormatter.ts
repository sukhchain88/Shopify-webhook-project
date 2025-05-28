// src\utils\shopifyFormatter.ts
import { Model } from 'sequelize';
import type { ProductWebhook } from '../validators/product.validator.js';

interface ProductAttributes {
  title: string;
  description: string | null;
  price: string | number;
  shopify_product_id: string;
  status: 'active' | 'draft' | 'archived';
  metadata: {
    vendor?: string | null;
    product_type?: string | null;
    tags?: string | null;
  };
}

export const formatShopifyProduct = (webhookData: ProductWebhook): Partial<ProductAttributes> => {
  return {
    title: webhookData.title,
    description: webhookData.body_html || null,
    price: webhookData.variants[0]?.price || '0',
    shopify_product_id: webhookData.id.toString(),
    status: webhookData.status,
    metadata: {
      vendor: webhookData.vendor,
      product_type: webhookData.product_type,
      tags: webhookData.tags
    }
  };
};
