// src\utils\shopifyFormatter.ts
import { ProductInstance } from '../models/product.js';

export const formatShopifyProductPayload = (product: ProductInstance) => {
  return {
    product: {
      title: product.title,
      body_html: product.description || '',
      vendor: product.metadata?.vendor || '',
      product_type: product.metadata?.product_type || '',
      tags: Array.isArray(product.metadata?.tags)
        ? product.metadata.tags.join(', ')
        : product.metadata?.tags || '',
      variants: [
        {
          price: product.price?.toString() || '',
        },
      ],
    },
  };
};
