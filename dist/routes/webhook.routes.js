// src\routes\webhook.routes.ts
import express from "express";
import { handleWebhook, getWebhook, handleProductWebhook } from "../controllers/webhook.controller.js";
const webhookRoutes = express.Router();
webhookRoutes.post("/", handleWebhook);
webhookRoutes.get("/", getWebhook);
webhookRoutes.post("/product", handleProductWebhook);
export default webhookRoutes;
