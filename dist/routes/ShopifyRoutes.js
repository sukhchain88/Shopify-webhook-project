// src\routes\shopify.routes.ts
import express from "express";
import { createWebhookHandler, listWebhooksHandler, deleteWebhookHandler, } from "../controllers/ShopifyController.js";
const router = express.Router();
// Register  - no need to add /shopify prefix as it's already in the path
router.post("/", createWebhookHandler);
router.get("/", listWebhooksHandler);
router.delete("/:id", deleteWebhookHandler);
export default router;
