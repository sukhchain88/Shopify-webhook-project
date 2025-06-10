// src\services\webhook.service.ts
import { Webhook } from "../models/Webhook.js";
import { shopifyApiService } from "./ShopifyService.js";
import { handleProductWebhook } from "../webhookHandlers/productHandler.js";
import { handleOrderWebhook } from "../webhookHandlers/orderHandler.js";
import { handleCustomerWebhook } from "../webhookHandlers/customerHandler.js";
import {
  WebhookOptions,
  WebhookResponse,
  WebhooksListResponse,
} from "../types/webhookInterface.js";

import { VALID_WEBHOOK_TOPICS } from "../config/webhookConstants.js";

export { VALID_WEBHOOK_TOPICS };

const normalizeAddress = (address: string): string => {
  return address.trim().toLowerCase();
};

export const listShopifyWebhooks = async (): Promise<WebhooksListResponse> => {
  try {
    const response = await shopifyApiService<WebhooksListResponse>(
      "GET",
      "webhooks.json"
    );
    return response;
  } catch (error: any) {
    console.error("❌ Failed to list webhooks:", error);
    if (error.response) {
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

export const createShopifyWebhook = async ({
  topic,
  address,
}: WebhookOptions): Promise<WebhookResponse> => {
  const cleanAddress = address.trim();
  const normalizedAddress = normalizeAddress(cleanAddress);

  try {
    const existingWebhooks = await listShopifyWebhooks();

    const existingWebhook = existingWebhooks.webhooks.find(
      (webhook: any) => webhook.topic === topic
    );

    if (
      existingWebhook &&
      normalizeAddress(existingWebhook.address) !== normalizedAddress
    ) {
      console.log(
        `🔁 Deleting old webhook for topic ${topic} at ${existingWebhook.address}`
      );
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

    const response = await shopifyApiService<WebhookResponse>(
      "POST",
      "webhooks.json",
      data
    );
    console.log(`✅ Webhook created successfully for topic: ${topic}`);
    return response;
  } catch (error: any) {
    console.error(`❌ Failed to create webhook for topic: ${topic}`, error);

    throw new Error(
      `Failed to create webhook: ${error.message || "Unknown error"}`
    );
  }
};

export const deleteShopifyWebhook = async (
  webhookId: number
): Promise<{ success: boolean }> => {
  try {
    await shopifyApiService("DELETE", `webhooks/${webhookId}.json`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Failed to delete webhook: ${webhookId}`, error);
    throw error;
  }
};

export class WebhookService {
  /**
   * Process a webhook based on its topic
   */
  static async processWebhook(topic: string, payload: any, shopDomain: string) {
    let webhook;
    try {
      // Store the webhook in the database first
      webhook = await this.storeWebhook(topic, payload, shopDomain);

      // Process based on topic
      await this.processWebhookByTopic(topic, payload);

      // Mark as processed
      await this.markWebhookAsProcessed(webhook);

      return webhook;
    } catch (error) {
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
  private static async storeWebhook(topic: string, payload: any, shopDomain: string) {
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
  private static async processWebhookByTopic(topic: string, payload: any) {
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
  private static async markWebhookAsProcessed(webhook: any) {
    try {
      await webhook.update({
        processed: true,
        processed_at: new Date()
      });
    } catch (error) {
      console.error('Error marking webhook as processed:', error);
    }
  }

  /**
   * Mark webhook as failed
   */
  private static async markWebhookAsFailed(webhook: any, errorMessage: string) {
    try {
      await webhook.update({
        processed: false,
        processed_at: new Date()
      });
      console.error('Webhook processing failed:', errorMessage);
    } catch (error) {
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
  static async getWebhookById(id: number) {
    return await Webhook.findByPk(id);
  }

  /**
   * Delete webhook from both database and Shopify
   */
  static async deleteWebhook(id: number) {
    const webhook = await this.getWebhookById(id);
    if (!webhook) {
      throw new Error("Webhook not found");
    }

    // Delete from Shopify first
    try {
      await shopifyApiService("DELETE", `webhooks/${id}.json`);
    } catch (error) {
      console.error("Failed to delete webhook from Shopify:", error);
      // Continue with local deletion even if Shopify deletion fails
    }

    // Delete from local database
    await webhook.destroy();
    return true;
  }
}


