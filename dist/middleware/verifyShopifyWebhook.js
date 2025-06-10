import crypto from 'crypto';
import { SHOPIFY_WEBHOOK_SECRET } from '../config/config.js';
class WebhookError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'WebhookError';
    }
}
export const verifyShopifyWebhook = (req, res, next) => {
    try {
        const hmacHeader = req.headers['x-shopify-hmac-sha256'];
        const topic = req.headers['x-shopify-topic'];
        const shopDomain = req.headers['x-shopify-shop-domain'];
        if (!hmacHeader || !topic || !shopDomain) {
            const error = new WebhookError(401, 'Missing required Shopify webhook headers');
            return next(error);
        }
        if (!SHOPIFY_WEBHOOK_SECRET) {
            const error = new WebhookError(500, 'Shopify webhook secret is not configured');
            return next(error);
        }
        const rawBody = req.body;
        if (!Buffer.isBuffer(rawBody)) {
            const error = new WebhookError(400, 'Request body must be raw buffer');
            return next(error);
        }
        const calculatedHmac = crypto
            .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('base64');
        console.log('🔐 Webhook verification:', {
            received: hmacHeader,
            calculated: calculatedHmac,
            match: calculatedHmac === hmacHeader
        });
        if (calculatedHmac !== hmacHeader) {
            console.error('❌ Invalid webhook signature:', {
                topic,
                shop: shopDomain,
                receivedHmac: hmacHeader,
                calculatedHmac
            });
            const error = new WebhookError(401, 'Invalid webhook signature');
            return next(error);
        }
        try {
            req.body = JSON.parse(rawBody.toString('utf8'));
        }
        catch (parseError) {
            console.error('❌ Failed to parse webhook body as JSON:', parseError);
            const error = new WebhookError(400, 'Invalid JSON in webhook body');
            return next(error);
        }
        console.log('✅ Valid Shopify webhook verified:', {
            topic,
            shop: shopDomain,
            bodySize: rawBody.length
        });
        next();
    }
    catch (error) {
        console.error('❌ Webhook verification error:', error);
        next(error);
    }
};
