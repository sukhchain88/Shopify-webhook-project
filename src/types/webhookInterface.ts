// src\types\webhookInterface.ts

/**
 * Options for creating a webhook
 */
export interface WebhookOptions {
  topic: string;
  address: string;
  format?: string;
}

/**
 * Webhook data structure
 */
export interface Webhook {
  id: number;
  address: string;
  topic: string;
  created_at: string;
  updated_at: string;
  format: string;
}

/**
 * Response from creating a webhook
 */
export interface WebhookResponse {
  webhook: Webhook;
}

/**
 * Response from listing webhooks
 */
export interface WebhooksListResponse {
  webhooks: Webhook[];
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  id: number;
  [key: string]: any;
}
  