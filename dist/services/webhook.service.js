// src\services\webhook.service.ts
import { shopifyApiService } from "./shopify.service.js";
export const VALID_WEBHOOK_TOPICS = [
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
