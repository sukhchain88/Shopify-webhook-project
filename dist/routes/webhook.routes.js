// src\routes\webhook.routes.ts
import express from "express";
import { handleWebhook, getWebhook, } from "../controllers/webhook.controller.js";
const webhookRoutes = express.Router();
webhookRoutes.post("/", handleWebhook);
webhookRoutes.get("/", getWebhook);
export default webhookRoutes;
