// src\controllers\shopify.controller.ts
// src\routes\shopify.routes.js
import express from "express";
import { 
  createShopifyWebhook, 
  listShopifyWebhooks, 
  deleteShopifyWebhook,
} from "../services/webhook.service.js";

/**
 * Create a new webhook
 * POST /create-webhook
 * Body: { webhook: { topic: string, address: string, format?: string } }
 */
export const createWebhookHandler = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { webhook } = req.body;
    console.log("📦 Webhook:", webhook);
    
    // Validate request body
    if (!webhook || !webhook.topic || !webhook.address) {
      res.status(400).json({ 
        error: "Missing required fields", 
        message: "Please provide webhook.topic and webhook.address" 
      });
      return;
    }
    
    // Log the webhook request
    console.log(`Attempting to create webhook for topic: ${webhook.topic}`);
    console.log(`Webhook address: ${webhook.address}`);
    
    // c Create the webhook
    const result = await createShopifyWebhook({ 
      topic: webhook.topic, 
      address: webhook.address 
    });
    
    // Check if this is a new webhook or an existing one
    const isExistingWebhook = result.webhook && result.webhook.id;
    
    res.status(isExistingWebhook ? 200 : 201).json({ 
      message: isExistingWebhook 
        ? "Webhook already exists and is being reused" 
        : "Webhook created successfully", 
      data: result 
    });
  } catch (err: any) {
    console.error("Error creating webhook:", err);
    
      res.status(500).json({ 
        error: "An unexpected error occurred", 
        message: err.message || "Unknown error" 
      });
    }
  }


/**
 * List all webhooks
 * GET /webhooks
 */
export const listWebhooksHandler = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const webhooks = await listShopifyWebhooks();
    res.status(200).json({ 
      message: "Webhooks retrieved successfully", 
      data: webhooks 
    });
  } catch (err: any) {
    console.error("Error listing webhooks:", err);
    res.status(500).json({ 
      error: "Failed to list webhooks", 
      message: err.message || "Unknown error" 
    });
  }
};

/**
 * Delete a webhook by ID
 * DELETE /webhooks/:id
 */
export const deleteWebhookHandler = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const webhookId = parseInt(req.params.id, 10);
    
    if (isNaN(webhookId)) {
      res.status(400).json({ 
        error: "Invalid webhook ID", 
        message: "Please provide a valid numeric webhook ID" 
      });
      return;
    }
    
    await deleteShopifyWebhook(webhookId);
    res.status(200).json({ 
      message: "Webhook deleted successfully", 
      webhookId 
    });
  } catch (err: any) {
    console.error("Error deleting webhook:", err);
    res.status(500).json({ 
      error: "Failed to delete webhook", 
      message: err.message || "Unknown error" 
    });
  }
};