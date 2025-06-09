// src\routes\webhook.routes.ts
import express, { RequestHandler } from "express";
import {
  handleWebhook,
  getWebhooks,
  getWebhookById,
  deleteWebhook
} from "../controllers/WebhookController.js";

const webhookRoutes = express.Router();

// Handle incoming webhooks
webhookRoutes.post("/", handleWebhook as unknown as RequestHandler);

// Get all webhooks with pagination
webhookRoutes.get("/", getWebhooks as unknown as RequestHandler);

// Get a single webhook by ID
webhookRoutes.get("/:id", getWebhookById as unknown as RequestHandler);

// Delete a webhook
webhookRoutes.delete("/:id", deleteWebhook as unknown as RequestHandler);

export default webhookRoutes;
