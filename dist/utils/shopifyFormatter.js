"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatShopifyProduct = void 0;
const formatShopifyProduct = (webhookData) => {
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
exports.formatShopifyProduct = formatShopifyProduct;
