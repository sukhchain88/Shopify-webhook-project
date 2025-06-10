"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = exports.deleteShopifyWebhook = exports.createShopifyWebhook = exports.listShopifyWebhooks = exports.VALID_WEBHOOK_TOPICS = void 0;
// src\services\webhook.service.ts
const Webhook_js_1 = require("../models/Webhook.js");
const ShopifyService_js_1 = require("./ShopifyService.js");
const productHandler_js_1 = require("../webhookHandlers/productHandler.js");
const orderHandler_js_1 = require("../webhookHandlers/orderHandler.js");
const customerHandler_js_1 = require("../webhookHandlers/customerHandler.js");
exports.VALID_WEBHOOK_TOPICS = [
    "customers/create",
    "customers/update",
    "customers/delete",
    "customers_marketing_consent/update",
    "orders/create",
    // Products
    "products/create",
    "products/update",
    "products/delete",
];
const normalizeAddress = (address) => {
    return address.trim().toLowerCase();
};
const listShopifyWebhooks = async () => {
    try {
        const response = await (0, ShopifyService_js_1.shopifyApiService)("GET", "webhooks.json");
        return response;
    }
    catch (error) {
        console.error("❌ Failed to list webhooks:", error);
        if (error.response) {
            console.error("Response data:", JSON.stringify(error.response.data, null, 2));
            console.error("Response status:", error.response.status);
        }
        throw error;
    }
};
exports.listShopifyWebhooks = listShopifyWebhooks;
const createShopifyWebhook = async ({ topic, address, }) => {
    const cleanAddress = address.trim();
    const normalizedAddress = normalizeAddress(cleanAddress);
    try {
        const existingWebhooks = await (0, exports.listShopifyWebhooks)();
        const existingWebhook = existingWebhooks.webhooks.find((webhook) => webhook.topic === topic);
        if (existingWebhook &&
            normalizeAddress(existingWebhook.address) !== normalizedAddress) {
            console.log(`🔁 Deleting old webhook for topic ${topic} at ${existingWebhook.address}`);
            await (0, exports.deleteShopifyWebhook)(existingWebhook.id);
        }
        console.log(`Creating webhook for topic: ${topic}`);
        const data = {
            webhook: {
                topic,
                address: cleanAddress,
                format: "json",
            },
        };
        const response = await (0, ShopifyService_js_1.shopifyApiService)("POST", "webhooks.json", data);
        console.log(`✅ Webhook created successfully for topic: ${topic}`);
        return response;
    }
    catch (error) {
        console.error(`❌ Failed to create webhook for topic: ${topic}`, error);
        throw new Error(`Failed to create webhook: ${error.message || "Unknown error"}`);
    }
};
exports.createShopifyWebhook = createShopifyWebhook;
const deleteShopifyWebhook = async (webhookId) => {
    try {
        await (0, ShopifyService_js_1.shopifyApiService)("DELETE", `webhooks/${webhookId}.json`);
        return { success: true };
    }
    catch (error) {
        console.error(`❌ Failed to delete webhook: ${webhookId}`, error);
        throw error;
    }
};
exports.deleteShopifyWebhook = deleteShopifyWebhook;
class WebhookService {
    /**
     * Process a webhook based on its topic
     */
    static async processWebhook(topic, payload, shopDomain) {
        let webhook;
        try {
            // Store the webhook in the database first
            webhook = await this.storeWebhook(topic, payload, shopDomain);
            // Process based on topic
            await this.processWebhookByTopic(topic, payload);
            // Mark as processed
            await this.markWebhookAsProcessed(webhook);
            return webhook;
        }
        catch (error) {
            console.error("Error processing webhook:", error);
            if (webhook && error instanceof Error) {
                await this.markWebhookAsFailed(webhook, error.message);
            }
            throw error;
        }
    }
    /**
     * Store webhook in database
     */
    static async storeWebhook(topic, payload, shopDomain) {
        return await Webhook_js_1.Webhook.create({
            topic,
            shop_domain: shopDomain,
            payload,
            processed: false
        });
    }
    /**
     * Process webhook based on topic
     */
    static async processWebhookByTopic(topic, payload) {
        // Add webhook_type to payload
        payload.webhook_type = topic;
        switch (topic) {
            case "customers/create":
            case "customers/update":
            case "customers/delete":
                await (0, customerHandler_js_1.handleCustomerWebhook)(payload);
                break;
            case "products/create":
            case "products/update":
            case "products/delete":
                await (0, productHandler_js_1.handleProductWebhook)(payload);
                break;
            case "orders/create":
            case "orders/updated":
            case "orders/cancelled":
            case "orders/fulfilled":
                await (0, orderHandler_js_1.handleOrderWebhook)(payload);
                break;
            default:
                console.log(`Unhandled webhook topic: ${topic}`);
        }
    }
    /**
     * Mark webhook as processed
     */
    static async markWebhookAsProcessed(webhook) {
        try {
            await webhook.update({
                processed: true,
                processed_at: new Date()
            });
        }
        catch (error) {
            console.error('Error marking webhook as processed:', error);
        }
    }
    /**
     * Mark webhook as failed
     */
    static async markWebhookAsFailed(webhook, errorMessage) {
        try {
            await webhook.update({
                processed: false,
                processed_at: new Date()
            });
            console.error('Webhook processing failed:', errorMessage);
        }
        catch (error) {
            console.error('Error marking webhook as failed:', error);
        }
    }
    /**
     * Get all webhooks with pagination
     */
    static async getWebhooks(page = 1, limit = 10) {
        return await Webhook_js_1.Webhook.findAndCountAll({
            order: [["id", "DESC"]],
            limit,
            offset: (page - 1) * limit
        });
    }
    /**
     * Get webhook by ID
     */
    static async getWebhookById(id) {
        return await Webhook_js_1.Webhook.findByPk(id);
    }
    /**
     * Delete webhook from both database and Shopify
     */
    static async deleteWebhook(id) {
        const webhook = await this.getWebhookById(id);
        if (!webhook) {
            throw new Error("Webhook not found");
        }
        // Delete from Shopify first
        try {
            await (0, ShopifyService_js_1.shopifyApiService)("DELETE", `webhooks/${id}.json`);
        }
        catch (error) {
            console.error("Failed to delete webhook from Shopify:", error);
            // Continue with local deletion even if Shopify deletion fails
        }
        // Delete from local database
        await webhook.destroy();
        return true;
    }
}
exports.WebhookService = WebhookService;
