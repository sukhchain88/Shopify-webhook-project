// src\services\webhook.service.ts
import { Webhook } from "../models/Webhook.js";
import { shopifyApiService } from "./ShopifyService.js";
import { handleProductWebhook } from "../webhookHandlers/productHandler.js";
import { handleOrderWebhook } from "../webhookHandlers/orderHandler.js";
import { handleCustomerWebhook } from "../webhookHandlers/customerHandler.js";
export const VALID_WEBHOOK_TOPICS = [
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
export const listShopifyWebhooks = async () => {
    try {
        const response = await shopifyApiService("GET", "webhooks.json");
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
export const createShopifyWebhook = async ({ topic, address, }) => {
    const cleanAddress = address.trim();
    const normalizedAddress = normalizeAddress(cleanAddress);
    try {
        const existingWebhooks = await listShopifyWebhooks();
        const existingWebhook = existingWebhooks.webhooks.find((webhook) => webhook.topic === topic);
        if (existingWebhook &&
            normalizeAddress(existingWebhook.address) !== normalizedAddress) {
            console.log(`🔁 Deleting old webhook for topic ${topic} at ${existingWebhook.address}`);
            await deleteShopifyWebhook(existingWebhook.id);
        }
        console.log(`Creating webhook for topic: ${topic}`);
        const data = {
            webhook: {
                topic,
                address: cleanAddress,
                format: "json",
            },
        };
        const response = await shopifyApiService("POST", "webhooks.json", data);
        console.log(`✅ Webhook created successfully for topic: ${topic}`);
        return response;
    }
    catch (error) {
        console.error(`❌ Failed to create webhook for topic: ${topic}`, error);
        throw new Error(`Failed to create webhook: ${error.message || "Unknown error"}`);
    }
};
export const deleteShopifyWebhook = async (webhookId) => {
    try {
        await shopifyApiService("DELETE", `webhooks/${webhookId}.json`);
        return { success: true };
    }
    catch (error) {
        console.error(`❌ Failed to delete webhook: ${webhookId}`, error);
        throw error;
    }
};
export class WebhookService {
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
        return await Webhook.create({
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
                await handleCustomerWebhook(payload);
                break;
            case "products/create":
            case "products/update":
            case "products/delete":
                await handleProductWebhook(payload);
                break;
            case "orders/create":
            case "orders/updated":
            case "orders/cancelled":
            case "orders/fulfilled":
                await handleOrderWebhook(payload);
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
        return await Webhook.findAndCountAll({
            order: [["id", "DESC"]],
            limit,
            offset: (page - 1) * limit
        });
    }
    /**
     * Get webhook by ID
     */
    static async getWebhookById(id) {
        return await Webhook.findByPk(id);
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
            await shopifyApiService("DELETE", `webhooks/${id}.json`);
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
