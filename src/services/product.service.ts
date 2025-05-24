// src\services\product.service.ts
import { Product } from "../models/product.js";
import { shopifyApiService } from "./shopify.service.js";
import { ShopifyProductResponse } from "../types/shopifyInterface.js";
import { formatShopifyProductPayload } from "../utils/shopifyFormatter.js";

export const createProductService = async (productInput: any) => {
  try {
    const productData = {
      title: productInput.title,
      price: parseFloat(productInput.variants[0].price),
      description: productInput.body_html || null,
      metadata: {
        vendor: productInput.vendor,
        product_type: productInput.product_type,
        tags: productInput.tags,
      },
    };

    const newProduct = await Product.create(productData);
    console.log("newProduct", newProduct);

    const shopifyPayload = formatShopifyProductPayload(newProduct);
    const shopifyResponse = await shopifyApiService<ShopifyProductResponse>(
      "post",
      `products.json`,
      shopifyPayload
    );
    console.log("shopifyResponse", shopifyResponse);
    if (shopifyResponse?.product?.id) {
      newProduct.shopify_product_id = shopifyResponse.product.id.toString();
      await newProduct.save();
    }

    return shopifyResponse.product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const fetchAllProductsService = async () => {
  return await Product.findAll({ raw: true });
};

