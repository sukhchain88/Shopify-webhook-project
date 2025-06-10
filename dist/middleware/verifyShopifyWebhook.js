"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyShopifyWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config/config");
class WebhookError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'WebhookError';
    }
}
const verifyShopifyWebhook = (req, res, next) => {
    try {
        const hmacHeader = req.headers['x-shopify-hmac-sha256'];
        const topic = req.headers['x-shopify-topic'];
        const shopDomain = req.headers['x-shopify-shop-domain'];
        if (!hmacHeader || !topic || !shopDomain) {
            const error = new WebhookError(401, 'Missing required Shopify webhook headers');
            return next(error);
        }
        if (!config_1.SHOPIFY_WEBHOOK_SECRET) {
            const error = new WebhookError(500, 'Shopify webhook secret is not configured');
            return next(error);
        }
        const rawBody = req.body;
        if (!Buffer.isBuffer(rawBody)) {
            const error = new WebhookError(400, 'Request body must be raw buffer');
            return next(error);
        }
        const calculatedHmac = crypto_1.default
            .createHmac('sha256', config_1.SHOPIFY_WEBHOOK_SECRET)
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
exports.verifyShopifyWebhook = verifyShopifyWebhook;
