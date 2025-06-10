"use strict";
/**
 * Shopify Webhook Verification Middleware
 *
 * Verifies the authenticity of incoming Shopify webhooks by:
 * 1. Checking required headers
 * 2. Validating HMAC signature
 * 3. Parsing the raw body as JSON
 *
 * @author Your Name
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyShopifyWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const config_js_1 = require("../config/config.js");
/**
 * Custom Error for Webhook Verification
 */
class WebhookError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'WebhookError';
    }
}
/**
 * Verify Shopify Webhook Middleware
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const verifyShopifyWebhook = (req, res, next) => {
    try {
        // Extract required headers
        const hmacHeader = req.headers['x-shopify-hmac-sha256'];
        const topic = req.headers['x-shopify-topic'];
        const shopDomain = req.headers['x-shopify-shop-domain'];
        // Validate required headers
        if (!hmacHeader || !topic || !shopDomain) {
            const error = new WebhookError(401, 'Missing required Shopify webhook headers');
            return next(error);
        }
        // Check if webhook secret is configured
        if (!config_js_1.SHOPIFY_WEBHOOK_SECRET) {
            const error = new WebhookError(500, 'Shopify webhook secret is not configured');
            return next(error);
        }
        // Validate raw body format
        const rawBody = req.body;
        if (!Buffer.isBuffer(rawBody)) {
            const error = new WebhookError(400, 'Request body must be raw buffer');
            return next(error);
        }
        // Calculate HMAC signature
        const calculatedHmac = crypto_1.default
            .createHmac('sha256', config_js_1.SHOPIFY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('base64');
        console.log('🔐 Webhook verification:', {
            received: hmacHeader,
            calculated: calculatedHmac,
            match: calculatedHmac === hmacHeader
        });
        // Verify HMAC signature
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
        // Parse the raw body as JSON and attach it to the request
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
        // Proceed to the next middleware
        next();
    }
    catch (error) {
        console.error('❌ Webhook verification error:', error);
        next(error);
    }
};
exports.verifyShopifyWebhook = verifyShopifyWebhook;
