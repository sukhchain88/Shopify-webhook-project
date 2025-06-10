import { Product } from "../models/Product.js";
export async function handleProductWebhook(payload) {
    try {
        const shopifyProductId = String(payload.id);
        const webhookType = payload.webhook_type || 'unknown';
        console.log(`Processing ${webhookType} product webhook for Shopify ID: ${shopifyProductId}`);
        if (webhookType === 'products/delete') {
            const existingProduct = await Product.findOne({
                where: { shopify_product_id: shopifyProductId },
            });
            if (existingProduct) {
                await existingProduct.destroy();
                console.log(`✅ Deleted product from database: Shopify ID ${shopifyProductId}`);
            }
            else {
                console.log(`⚠️ Product not found for deletion: Shopify ID ${shopifyProductId}`);
            }
            return;
        }
        if (!payload.title) {
            console.error(`❌ Product webhook missing title field for ${webhookType}`);
            throw new Error(`Product webhook missing required title field`);
        }
        const productData = {
            title: payload.title,
            price: parseFloat(String(payload.variants?.[0]?.price)) || 0,
            description: payload.body_html || null,
            shopify_product_id: shopifyProductId,
            status: payload.status || 'active',
            metadata: {
                vendor: payload.vendor,
                product_type: payload.product_type,
                tags: payload.tags,
            },
        };
        const existingProduct = await Product.findOne({
            where: { shopify_product_id: shopifyProductId },
        });
        if (existingProduct) {
            await existingProduct.update(productData);
            console.log(`✅ Updated product in database: ${payload.title} (ID: ${shopifyProductId})`);
        }
        else {
            await Product.create(productData);
            console.log(`✅ Created new product in database: ${payload.title} (ID: ${shopifyProductId})`);
        }
    }
    catch (error) {
        console.error("Error handling product webhook:", error);
        throw error;
    }
}
