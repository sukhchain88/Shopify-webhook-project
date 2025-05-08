// src\services\product.service.ts
import { Product } from "../models/product.js";
import { shopifyApiService } from "./shopify.service.js";
import { ShopifyProductResponse } from "../types/shopifyInterface.js";
import { formatShopifyProductPayload } from "../utils/shopifyFormatter.js";

export const createProductService = async (productInput: any) => {
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

  const shopifyPayload = formatShopifyProductPayload(newProduct);
  const shopifyResponse = await shopifyApiService<ShopifyProductResponse>("post", `products.json`, shopifyPayload);

  if (shopifyResponse?.product?.id) {
    newProduct.shopify_product_id = shopifyResponse.product.id.toString();
    await newProduct.save();
  }

  return shopifyResponse.product;
};

export const fetchAllProductsService = async () => {
  const products = await Product.findAll({ raw: true });
  return products;
};
