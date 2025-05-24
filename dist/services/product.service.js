// src\services\product.service.ts
import { Product } from "../models/product.js";
import { shopifyApiService } from "./shopify.service.js";
import { formatShopifyProductPayload } from "../utils/shopifyFormatter.js";
// export const createProductService = async (productInput: any) => {
//   const productData = {
//     title: productInput.title,
//     price: parseFloat(productInput.variants[0].price),
//     description: productInput.body_html || null,
//     metadata: {
//       vendor: productInput.vendor,
//       product_type: productInput.product_type,
//       tags: productInput.tags,
//     },
//   };
//   // const newProduct = await Product.create(productData);
//   const shopifyPayload = formatShopifyProductPayload(productData as any);
//   const shopifyResponse = await shopifyApiService<ShopifyProductResponse>("post", `products.json`, shopifyPayload);
//   const [product, created] = await Product.upsert(productData);
//   console.log(created ? "Product created in DB." : "Product updated in DB.");
//   if (shopifyResponse?.product?.id) {
//     product.shopify_product_id = shopifyResponse.product.id.toString();
//     await product.save();
//   }
//   return shopifyResponse.product;
// };
export const createProductService = async (productInput) => {
    // 1. Prepare product data (without Shopify ID yet)
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
    // 2. Send to Shopify
    const shopifyPayload = formatShopifyProductPayload(productData);
    const shopifyResponse = await shopifyApiService("post", "products.json", shopifyPayload);
    // 3. Check Shopify response
    if (!shopifyResponse?.product?.id) {
        throw new Error("Failed to create product in Shopify.");
    }
    // 4. Add Shopify product ID before saving to DB
    const finalProductData = {
        ...productData,
        shopify_product_id: shopifyResponse.product.id.toString(),
    };
    // 5. Upsert into PostgreSQL
    const [product, created] = await Product.upsert(finalProductData, {
        returning: true,
        conflictFields: ["shopify_product_id"],
    });
    console.log(created ? "✅ Product created in DB." : "♻️ Product updated in DB.");
    return shopifyResponse.product;
};
export const fetchAllProductsService = async () => {
    const products = await Product.findAll({ raw: true });
    return products;
};
