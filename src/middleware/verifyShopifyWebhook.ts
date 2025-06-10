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

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { SHOPIFY_WEBHOOK_SECRET } from '../config/config.js';

/**
 * Custom Error for Webhook Verification
 */
class WebhookError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
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
export const verifyShopifyWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract required headers
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
    const topic = req.headers['x-shopify-topic'] as string;
    const shopDomain = req.headers['x-shopify-shop-domain'] as string;

    // Validate required headers
    if (!hmacHeader || !topic || !shopDomain) {
      const error = new WebhookError(401, 'Missing required Shopify webhook headers');
      return next(error);
    }

    // Check if webhook secret is configured
    if (!SHOPIFY_WEBHOOK_SECRET) {
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
    const calculatedHmac = crypto
      .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
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
    } catch (parseError) {
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
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    next(error);
  }
}; 