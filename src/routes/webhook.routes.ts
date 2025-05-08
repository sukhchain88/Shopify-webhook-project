// src\routes\webhook.routes.ts
import express, { RequestHandler } from "express";
import {
  handleWebhook,
  deleteOldNgrokWebhooks,
  getWebhook,
} from "../controllers/webhook.controller.js";

const webhookRoutes = express.Router();

webhookRoutes.post("/", handleWebhook as unknown as RequestHandler);
webhookRoutes.get("/", getWebhook as unknown as RequestHandler);

export default webhookRoutes;
