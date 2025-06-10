"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWebhookHandler = exports.listWebhooksHandler = exports.createWebhookHandler = void 0;
const WebhookService_1 = require("../services/WebhookService");
const createWebhookHandler = async (req, res) => {
    try {
        const { webhook } = req.body;
        console.log("📦 Webhook:", webhook);
        if (!webhook || !webhook.topic || !webhook.address) {
            res.status(400).json({
                error: "Missing required fields",
                message: "Please provide webhook.topic and webhook.address"
            });
            return;
        }
        console.log(`Attempting to create webhook for topic: ${webhook.topic}`);
        console.log(`Webhook address: ${webhook.address}`);
        const result = await (0, WebhookService_1.createShopifyWebhook)({
            topic: webhook.topic,
            address: webhook.address
        });
        const isExistingWebhook = result.webhook && result.webhook.id;
        res.status(isExistingWebhook ? 200 : 201).json({
            message: isExistingWebhook
                ? "Webhook already exists and is being reused"
                : "Webhook created successfully",
            data: result
        });
    }
    catch (err) {
        console.error("Error creating webhook:", err);
        res.status(500).json({
            error: "An unexpected error occurred",
            message: err.message || "Unknown error"
        });
    }
};
exports.createWebhookHandler = createWebhookHandler;
const listWebhooksHandler = async (req, res) => {
    try {
        const webhooks = await (0, WebhookService_1.listShopifyWebhooks)();
        res.status(200).json({
            message: "Webhooks retrieved successfully",
            data: webhooks
        });
    }
    catch (err) {
        console.error("Error listing webhooks:", err);
        res.status(500).json({
            error: "Failed to list webhooks",
            message: err.message || "Unknown error"
        });
    }
};
exports.listWebhooksHandler = listWebhooksHandler;
const deleteWebhookHandler = async (req, res) => {
    try {
        const webhookId = parseInt(req.params.id, 10);
        if (isNaN(webhookId)) {
            res.status(400).json({
                error: "Invalid webhook ID",
                message: "Please provide a valid numeric webhook ID"
            });
            return;
        }
        await (0, WebhookService_1.deleteShopifyWebhook)(webhookId);
        res.status(200).json({
            message: "Webhook deleted successfully",
            webhookId
        });
    }
    catch (err) {
        console.error("Error deleting webhook:", err);
        res.status(500).json({
            error: "Failed to delete webhook",
            message: err.message || "Unknown error"
        });
    }
};
exports.deleteWebhookHandler = deleteWebhookHandler;
