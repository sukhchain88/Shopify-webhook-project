import express from "express";
import { handleWebhook, getWebhooks, getWebhookById, deleteWebhook } from "../controllers/WebhookController.js";
const webhookRoutes = express.Router();
webhookRoutes.post("/", handleWebhook);
webhookRoutes.get("/", getWebhooks);
webhookRoutes.get("/:id", getWebhookById);
webhookRoutes.delete("/:id", deleteWebhook);
export default webhookRoutes;
