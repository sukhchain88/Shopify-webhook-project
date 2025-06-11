// src\services\product.service.ts
import { Product } from "../models";
import { shopifyApiService } from "./ShopifyService";
import { ShopifyProductResponse } from "../types/shopifyInterface";
import { formatShopifyProduct } from "../utils/shopifyFormatter";
import type { ProductWebhook } from "../validators/product.validator";

interface ProductAttributes {
  title: string;
  description: string | null;
  price: number;
  shopify_product_id?: string;
  status: 'active' | 'draft' | 'archived';
  metadata: {
    vendor: string | null;
    product_type: string | null;
    tags: string | null;
  };
}

interface ShopifyProductPayload {
  product: {
    title: string;
    body_html?: string;
    vendor?: string;
    product_type?: string;
    status?: string;
    tags?: string;
    variants: Array<{
      price: string;
      inventory_quantity?: number;
      sku?: string;
    }>;
  };
}

interface ShopifyResponse {
  product: {
    id: number;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    status: string;
    variants: Array<{
      price: string;
      id: number;
    }>;
  };
}

export class ProductService {
  static async createProduct(data: any) {
    return await Product.create(data);
  }

  static async handleWebhook(webhookData: ProductWebhook) {
    const productData = formatShopifyProduct(webhookData);
    return await Product.create(productData);
  }

  /**
   * Create a new product in Shopify admin store
   */
  static async createProductInShopify(productData: ProductAttributes): Promise<ShopifyResponse> {
    const shopifyPayload: ShopifyProductPayload = {
      product: {
        title: productData.title,
        body_html: productData.description || "",
        vendor: productData.metadata?.vendor || "",
        product_type: productData.metadata?.product_type || "",
        status: productData.status,
        tags: productData.metadata?.tags || "",
        variants: [
          {
            price: productData.price.toString(),
            inventory_quantity: 100, // Default inventory
          }
        ]
      }
    };

    try {
      const response = await shopifyApiService<ShopifyResponse>(
        "POST",
        "products.json",
        shopifyPayload
      );

      console.log(`✅ Product created in Shopify: ${response.product.title} (ID: ${response.product.id})`);
      return response;
    } catch (error) {
      console.error("❌ Failed to create product in Shopify:", error);
      throw error;
    }
  }

  /**
   * Update an existing product in Shopify admin store
   */
  static async updateProductInShopify(shopifyProductId: string, productData: Partial<ProductAttributes>): Promise<ShopifyResponse> {
    const shopifyPayload: { product: Partial<ShopifyProductPayload['product']> } = {
      product: {}
    };

    if (productData.title) shopifyPayload.product.title = productData.title;
    if (productData.description !== undefined) shopifyPayload.product.body_html = productData.description || "";
    if (productData.status) shopifyPayload.product.status = productData.status;
    if (productData.metadata?.vendor) shopifyPayload.product.vendor = productData.metadata.vendor;
    if (productData.metadata?.product_type) shopifyPayload.product.product_type = productData.metadata.product_type;
    if (productData.metadata?.tags) shopifyPayload.product.tags = productData.metadata.tags;

    try {
      const response = await shopifyApiService<ShopifyResponse>(
        "PUT",
        `products/${shopifyProductId}.json`,
        shopifyPayload
      );

      console.log(`✅ Product updated in Shopify: ${response.product.title} (ID: ${response.product.id})`);
      return response;
    } catch (error) {
      console.error("❌ Failed to update product in Shopify:", error);
      throw error;
    }
  }

  /**
   * Get a product from Shopify admin store
   */
  static async getProductFromShopify(shopifyProductId: string): Promise<ShopifyResponse> {
    try {
      const response = await shopifyApiService<ShopifyResponse>(
        "GET",
        `products/${shopifyProductId}.json`
      );

      console.log(`✅ Product retrieved from Shopify: ${response.product.title}`);
      return response;
    } catch (error) {
      console.error("❌ Failed to get product from Shopify:", error);
      throw error;
    }
  }

  /**
   * Delete a product from Shopify admin store
   */
  static async deleteProductFromShopify(shopifyProductId: string): Promise<void> {
    try {
      await shopifyApiService<void>(
        "DELETE",
        `products/${shopifyProductId}.json`
      );

      console.log(`✅ Product deleted from Shopify (ID: ${shopifyProductId})`);
    } catch (error) {
      console.error("❌ Failed to delete product from Shopify:", error);
      throw error;
    }
  }

  /**
   * Sync local product to Shopify admin store
   */
  static async syncProductToShopify(localProduct: any): Promise<ShopifyResponse> {
    const productData: ProductAttributes = {
      title: localProduct.title,
      description: localProduct.description,
      price: parseFloat(localProduct.price),
      status: localProduct.status,
      metadata: {
        vendor: localProduct.metadata?.vendor || null,
        product_type: localProduct.metadata?.product_type || null,
        tags: localProduct.metadata?.tags || null,
      }
    };

    if (localProduct.shopify_product_id) {
      // Update existing product
      return await this.updateProductInShopify(localProduct.shopify_product_id, productData);
    } else {
      // Create new product
      const response = await this.createProductInShopify(productData);
      
      // Update local product with Shopify ID
      await Product.update(
        { shopify_product_id: response.product.id.toString() },
        { where: { id: localProduct.id } }
      );
      
      return response;
    }
  }
}

export const fetchAllProductsService = async () => {
  return await Product.findAll({ raw: true });
};

