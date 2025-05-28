import { Product } from "../models/product.js";

export async function handleProductWebhook(payload: any) {
  try {
    // Convert Shopify product ID to string
    const shopifyProductId = String(payload.id);
    const webhookType = payload.webhook_type || 'unknown';
    
    console.log(
      `Processing ${webhookType} product webhook for Shopify ID: ${shopifyProductId}`
    );

    // Handle delete webhooks differently (they don't have title/variants)
    if (webhookType === 'products/delete') {
      const existingProduct = await Product.findOne({
        where: { shopify_product_id: shopifyProductId },
      });

      if (existingProduct) {
        await existingProduct.destroy();
        console.log(
          `✅ Deleted product from database: Shopify ID ${shopifyProductId}`
        );
      } else {
        console.log(
          `⚠️ Product not found for deletion: Shopify ID ${shopifyProductId}`
        );
      }
      return;
    }

    // For create/update webhooks, validate required fields
    if (!payload.title) {
      console.error(`❌ Product webhook missing title field for ${webhookType}`);
      throw new Error(`Product webhook missing required title field`);
    }

    // Extract relevant data from the webhook payload
    const productData = {
      title: payload.title,
      price: parseFloat(String(payload.variants?.[0]?.price)) || 0,
      description: payload.body_html || null,
      shopify_product_id: shopifyProductId, // Store as string
      status: payload.status || 'active',
      metadata: {
        vendor: payload.vendor,
        product_type: payload.product_type,
        tags: payload.tags,
      },
    };

    // Check if product exists
    const existingProduct = await Product.findOne({
      where: { shopify_product_id: shopifyProductId }, // Use string ID
    });

    if (existingProduct) {
      // Update existing product
      await existingProduct.update(productData);
      console.log(
        `✅ Updated product in database: ${payload.title} (ID: ${shopifyProductId})`
      );
    } else {
      // Create new product
      await Product.create(productData);
      console.log(
        `✅ Created new product in database: ${payload.title} (ID: ${shopifyProductId})`
      );
    }
  } catch (error) {
    console.error("Error handling product webhook:", error);
    throw error;
  }
} 