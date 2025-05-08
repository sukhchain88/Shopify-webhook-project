// src\routes\shopify.routes.ts
import express, { RequestHandler } from "express";
import {
  createWebhookHandler,
  listWebhooksHandler,
  deleteWebhookHandler,
} from "../controllers/shopify.controller.js";

const router = express.Router();



// Register  - no need to add /shopify prefix as it's already in the path
router.post("/",  createWebhookHandler as unknown as RequestHandler);
router.get("/", listWebhooksHandler as unknown as RequestHandler);
router.delete("/:id", deleteWebhookHandler as unknown as RequestHandler);

export default router;
