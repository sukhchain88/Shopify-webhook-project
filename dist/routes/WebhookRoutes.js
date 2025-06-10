// src\routes\webhook.routes.ts
import express from "express";
import { handleWebhook, getWebhooks, getWebhookById, deleteWebhook } from "../controllers/WebhookController.js";
const webhookRoutes = express.Router();
// Handle incoming webhooks
webhookRoutes.post("/", handleWebhook);
// Get all webhooks with pagination
webhookRoutes.get("/", getWebhooks);
// Get a single webhook by ID
webhookRoutes.get("/:id", getWebhookById);
// Delete a webhook
webhookRoutes.delete("/:id", deleteWebhook);
export default webhookRoutes;
