// src\controllers\webhook.controller.ts
import { Request, Response } from "express";
import { validateWebhookSignature } from "../utils/validateWebhookSignature";
import { WebhookService } from "../services/WebhookService";
import { validateWebhookPayload } from "../validators/webhook.validator";

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const topic = req.headers["x-shopify-topic"] as string;
    const shopDomain = req.headers["x-shopify-shop-domain"] as string;

    // 1. Check required headers
    if (!topic || !shopDomain) {
      console.log("Missing required headers", { topic, shopDomain });
      return res.status(400).json({
        success: false,
        error: "Missing required headers",
        message: "Both x-shopify-topic and x-shopify-shop-domain headers are required",
      });
    }

    // 2. Validate signature
    if (!validateWebhookSignature(req)) {
      console.log("Webhook signature validation failed");
      return res.status(401).json({
        success: false,
        error: "Invalid signature",
        message: "Webhook signature mismatch",
      });
    }

    // 3. Parse payload
    let payload: any;
    try {
      // req.body is a Buffer from express.raw() middleware
      const rawBodyBuffer = req.body as Buffer;
      const rawBodyString = rawBodyBuffer.toString('utf8');
      payload = JSON.parse(rawBodyString);
      
      // Ensure shop_domain is set
      if (!payload.shop_domain) {
        payload.shop_domain = shopDomain;
      }
    } catch (parseError) {
      console.log("Failed to parse webhook payload", parseError);
      return res.status(400).json({
        success: false,
        error: "Invalid JSON",
        message: "Failed to parse webhook payload",
      });
    }

    // 4. Validate payload schema
    const validationResult = validateWebhookPayload(topic, payload);
    if (!validationResult.success) {
      console.log("Webhook payload validation failed:", validationResult.error);
      return res.status(400).json({
        success: false,
        error: "Invalid payload",
        message: "Webhook payload validation failed",
        details: validationResult.error.errors
      });
    }

    // 5. Process webhook
    console.log(`📥 Processing webhook: ${topic}`);
    const webhook = await WebhookService.processWebhook(topic, payload, shopDomain);

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      topic,
      shopDomain,
      webhookId: (webhook as any).id
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all webhooks with pagination
 */
export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const webhooks = await WebhookService.getWebhooks(page, limit);
    
    return res.status(200).json({
      success: true,
      data: webhooks.rows,
      pagination: {
        total: webhooks.count,
        page,
        limit,
        pages: Math.ceil(webhooks.count / limit)
      }
    });
  } catch (err) {
    console.error("Error fetching webhooks:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch webhooks",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

/**
 * Get a single webhook by ID
 */
export const getWebhookById = async (req: Request, res: Response) => {
  try {
    const webhook = await WebhookService.getWebhookById(parseInt(req.params.id));
    
    if (!webhook) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "Webhook not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: webhook
    });
  } catch (err) {
    console.error("Error fetching webhook:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch webhook",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

/**
 * Delete a webhook
 */
export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    await WebhookService.deleteWebhook(parseInt(req.params.id));
    
    return res.status(200).json({
      success: true,
      message: "Webhook deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting webhook:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to delete webhook",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
