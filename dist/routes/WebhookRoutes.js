"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const WebhookController_1 = require("../controllers/WebhookController");
const webhookRoutes = express_1.default.Router();
webhookRoutes.post("/", WebhookController_1.handleWebhook);
webhookRoutes.get("/", WebhookController_1.getWebhooks);
webhookRoutes.get("/:id", WebhookController_1.getWebhookById);
webhookRoutes.delete("/:id", WebhookController_1.deleteWebhook);
exports.default = webhookRoutes;
