// src\services\shopify.service.ts
import { Method } from "axios";
import axios from "axios";
import {
  SHOPIFY_STORE_URL,
  SHOPIFY_ACCESS_TOKEN,
  WEBHOOK_BASE_URL,
} from "../config/config";
import { VALID_WEBHOOK_TOPICS } from "../config/webhookConstants";

export const shopifyApiService = async <T>(
  method: Method,
  endpoint: string,
  data?: object
): Promise<T> => {
  if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
    throw new Error(
      "Shopify API credentials are not configured. Please check your .env file."
    );
  }

  const url = `https://${SHOPIFY_STORE_URL}/admin/api/2025-04/${endpoint}`;

  try {
    const response = await axios({
      method,
      url,
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      data,
    });

    return response.data;
  } catch (error: any) {
    console.error(
      `Shopify API error for ${method} ${endpoint}:`,
      error.message,
      error.response?.data?.errors || ""
    );
    throw error;
  }
};

export const verifyAndRegisterWebhooks = async (): Promise<boolean> => {
  if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN || !WEBHOOK_BASE_URL) {
    throw new Error("Missing required environment variables");
  }

  const webhookUrl = WEBHOOK_BASE_URL.trim();

  try {
    const { webhooks: existingWebhooks } = await shopifyApiService<{
      webhooks: any[];
    }>("GET", "webhooks.json");

    for (const topic of VALID_WEBHOOK_TOPICS) {
      try {
        const existingWebhook = existingWebhooks.find(
          (webhook) => webhook.topic === topic
        );

        if (existingWebhook) {
          // If the webhook exists but with a different URL, update it
          if (
            normalizeUrl(existingWebhook.address) !== normalizeUrl(webhookUrl)
          ) {
            await shopifyApiService(
              "PUT",
              `webhooks/${existingWebhook.id}.json`,
              {
                webhook: { id: existingWebhook.id, address: webhookUrl },
              }
            );
            console.log(`Updated webhook for topic: ${topic}`);
          } else {
            console.log(`Webhook already exists for topic: ${topic}`);
          }
        } else {
          // Create a new webhook if it doesn't exist
          await shopifyApiService("POST", "webhooks.json", {
            webhook: {
              topic,
              address: webhookUrl,
              format: "json",
            },
          });
          console.log(`Registered webhook for topic: ${topic}`);
        }
      } catch (error: any) {
        console.error(`Failed to process webhook for topic: ${topic}`, error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error("Error verifying/registering webhooks:", error);
    throw error;
  }
};

// Helper function to normalize URLs for comparison
const normalizeUrl = (url: string): string => {
  return url.trim().toLowerCase().replace(/\/+$/, "");
};

export const listRegisteredWebhooks = async () => {
  try {
    const response = await shopifyApiService<{ webhooks: any[] }>(
      "GET",
      "webhooks.json"
    );

    console.log("Registered Webhooks:");
    response.webhooks.forEach((webhook) => {
      console.log(`- Topic: ${webhook.topic}`);
      console.log(`  Address: ${webhook.address}`);
      console.log(`  Status: ${webhook.status}`);
      console.log("---");
    });

    return response.webhooks;
  } catch (error) {
    console.error("Error listing webhooks:", error);
    throw error;
  }
};
