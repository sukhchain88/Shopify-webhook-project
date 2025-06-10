"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src\routes\webhook.routes.ts
const express_1 = __importDefault(require("express"));
const WebhookController_js_1 = require("../controllers/WebhookController.js");
const webhookRoutes = express_1.default.Router();
// Handle incoming webhooks
webhookRoutes.post("/", WebhookController_js_1.handleWebhook);
// Get all webhooks with pagination
webhookRoutes.get("/", WebhookController_js_1.getWebhooks);
// Get a single webhook by ID
webhookRoutes.get("/:id", WebhookController_js_1.getWebhookById);
// Delete a webhook
webhookRoutes.delete("/:id", WebhookController_js_1.deleteWebhook);
exports.default = webhookRoutes;
