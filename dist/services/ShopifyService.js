"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRegisteredWebhooks = exports.verifyAndRegisterWebhooks = exports.shopifyApiService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const WebhookService_1 = require("./WebhookService");
const shopifyApiService = async (method, endpoint, data) => {
    if (!config_1.SHOPIFY_STORE_URL || !config_1.SHOPIFY_ACCESS_TOKEN) {
        throw new Error("Shopify API credentials are not configured. Please check your .env file.");
    }
    const url = `https://${config_1.SHOPIFY_STORE_URL}/admin/api/2025-04/${endpoint}`;
    try {
        const response = await (0, axios_1.default)({
            method,
            url,
            headers: {
                "X-Shopify-Access-Token": config_1.SHOPIFY_ACCESS_TOKEN,
                "Content-Type": "application/json",
            },
            data,
        });
        return response.data;
    }
    catch (error) {
        console.error(`Shopify API error for ${method} ${endpoint}:`, error.message, error.response?.data?.errors || "");
        throw error;
    }
};
exports.shopifyApiService = shopifyApiService;
const verifyAndRegisterWebhooks = async () => {
    if (!config_1.SHOPIFY_STORE_URL || !config_1.SHOPIFY_ACCESS_TOKEN || !config_1.WEBHOOK_BASE_URL) {
        throw new Error("Missing required environment variables");
    }
    const webhookUrl = config_1.WEBHOOK_BASE_URL.trim();
    try {
        const { webhooks: existingWebhooks } = await (0, exports.shopifyApiService)("GET", "webhooks.json");
        for (const topic of WebhookService_1.VALID_WEBHOOK_TOPICS) {
            try {
                const existingWebhook = existingWebhooks.find((webhook) => webhook.topic === topic);
                if (existingWebhook) {
                    // If the webhook exists but with a different URL, update it
                    if (normalizeUrl(existingWebhook.address) !== normalizeUrl(webhookUrl)) {
                        await (0, exports.shopifyApiService)("PUT", `webhooks/${existingWebhook.id}.json`, {
                            webhook: { id: existingWebhook.id, address: webhookUrl },
                        });
                        console.log(`Updated webhook for topic: ${topic}`);
                    }
                    else {
                        console.log(`Webhook already exists for topic: ${topic}`);
                    }
                }
                else {
                    // Create a new webhook if it doesn't exist
                    await (0, exports.shopifyApiService)("POST", "webhooks.json", {
                        webhook: {
                            topic,
                            address: webhookUrl,
                            format: "json",
                        },
                    });
                    console.log(`Registered webhook for topic: ${topic}`);
                }
            }
            catch (error) {
                console.error(`Failed to process webhook for topic: ${topic}`, error);
                throw error;
            }
        }
        return true;
    }
    catch (error) {
        console.error("Error verifying/registering webhooks:", error);
        throw error;
    }
};
exports.verifyAndRegisterWebhooks = verifyAndRegisterWebhooks;
// Helper function to normalize URLs for comparison
const normalizeUrl = (url) => {
    return url.trim().toLowerCase().replace(/\/+$/, "");
};
const listRegisteredWebhooks = async () => {
    try {
        const response = await (0, exports.shopifyApiService)("GET", "webhooks.json");
        console.log("Registered Webhooks:");
        response.webhooks.forEach((webhook) => {
            console.log(`- Topic: ${webhook.topic}`);
            console.log(`  Address: ${webhook.address}`);
            console.log(`  Status: ${webhook.status}`);
            console.log("---");
        });
        return response.webhooks;
    }
    catch (error) {
        console.error("Error listing webhooks:", error);
        throw error;
    }
};
exports.listRegisteredWebhooks = listRegisteredWebhooks;
