import { Product } from "../models/product.js";
export async function handleProductWebhook(payload) {
    try {
        // Convert Shopify product ID to string
        const shopifyProductId = String(payload.id);
        console.log(`Processing product webhook for Shopify ID: ${shopifyProductId}`);
        // Extract relevant data from the webhook payload
        const productData = {
            title: payload.title,
            price: parseFloat(String(payload.variants?.[0]?.price)) || 0,
            description: payload.body_html || null,
            shopify_product_id: shopifyProductId, // Store as string
            status: payload.status,
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
            console.log(`✅ Updated product in database: ${payload.title} (ID: ${shopifyProductId})`);
        }
        else {
            // Create new product
            await Product.create(productData);
            console.log(`✅ Created new product in database: ${payload.title} (ID: ${shopifyProductId})`);
        }
    }
    catch (error) {
        console.error("Error handling product webhook:", error);
        throw error;
    }
}
