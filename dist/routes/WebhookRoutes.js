"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const WebhookController_js_1 = require("../controllers/WebhookController.js");
const webhookRoutes = express_1.default.Router();
webhookRoutes.post("/", WebhookController_js_1.handleWebhook);
webhookRoutes.get("/", WebhookController_js_1.getWebhooks);
webhookRoutes.get("/:id", WebhookController_js_1.getWebhookById);
webhookRoutes.delete("/:id", WebhookController_js_1.deleteWebhook);
exports.default = webhookRoutes;
