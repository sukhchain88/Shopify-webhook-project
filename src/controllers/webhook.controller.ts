// src\controllers\webhook.controller.ts
import { Request, Response } from "express";
import { validateWebhookSignature } from "../utils/validateWebhookSignature.js"; 
import { shopifyApiService } from "../services/shopify.service.js";
import { Webhook } from "../models/webhook.js";
import { SHOPIFY_WEBHOOK_SECRET } from "../config/config.js";

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const topic = req.headers["x-shopify-topic"];
    const shopDomain = req.headers["x-shopify-shop-domain"];

    console.log("BODY TYPE:", typeof req.body, Buffer.isBuffer(req.body));

    // Validate the webhook FIRST before any processing
    const webhookSecret = SHOPIFY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.log("SHOPIFY_WEBHOOK_SECRET is not configured");
      return res.status(500).json({
        success: false,
        error: "Configuration Error",
        message: "SHOPIFY_WEBHOOK_SECRET is not configured",
      });
    }

    if (!validateWebhookSignature(req, webhookSecret)) {
      console.log("Webhook signature mismatch");
      return res.status(401).json({
        success: false,
        error: "Invalid signature",
        message: "Webhook signature mismatch",
      });
    }

    if (!topic || !shopDomain) {
      console.log("Missing required headers", { topic, shopDomain });
      return res.status(400).json({
        success: false,
        error: "Missing required headers",
        message:
          "Both x-shopify-topic and x-shopify-shop-domain headers are required",
      });
    }

    // Parse the payload AFTER validation
    let payload: any;
    try {
      payload = JSON.parse(req.body.toString("utf8"));
    } catch (parseError) {
      console.log("Failed to parse webhook payload", parseError);
      return res.status(400).json({
        success: false,
        error: "Invalid JSON",
        message: "Failed to parse webhook payload",
      });
    }

    console.log("Webhook received", {
      path: req.path,
      topic,
      shopDomain,
      payload: JSON.stringify(payload).substring(0, 100) + "...",
    });

    // Store the webhook in the database
    await Webhook.create({
      topic: topic as string,
      shop_domain: shopDomain as string,
      payload: payload,
      processed: false,
    });

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      topic,
      shopDomain,
    });
  } catch (error) {
    console.log("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a webhook from Shopify
 */
export const deleteOldNgrokWebhooks = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await shopifyApiService("DELETE", `webhooks/${id}.json`);
    console.log(`Webhook ${id} deleted successfully`);
    return res.status(200).json({
      success: true,
      message: `Webhook ${id} deleted successfully`,
    });
  } catch (err) {
    console.log("Error deleting webhook:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to delete webhook",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

/**
 * Get all webhooks from the database
 */
export const getWebhook = async (req: Request, res: Response) => {
  try {
    const webhooks = await Webhook.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    console.log(`Retrieved ${webhooks.length} webhooks`);
    return res.status(200).json({
      success: true,
      webhooks,
    });
  } catch (err) {
    console.log("Error fetching webhooks:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch webhooks",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
