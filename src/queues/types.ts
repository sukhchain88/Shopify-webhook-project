/**
 * Job Data Type Definitions
 * 
 * This file contains all the TypeScript interfaces for different types of jobs
 * that can be processed by our queue system. This ensures type safety and
 * makes it clear what data each job type expects.
 */

/**
 * Base Job Interface
 * 
 * Common properties that all jobs should have for tracking and logging
 */
export interface BaseJobData {
  /** Unique identifier for tracking this job across systems */
  correlationId?: string;
  /** Timestamp when the job was created */
  createdAt?: Date;
  /** User or system that initiated this job */
  initiatedBy?: string;
  /** Additional metadata for the job */
  metadata?: Record<string, any>;
}

/**
 * Email Job Data
 * 
 * Used for sending emails through the email queue.
 * Supports both simple emails and template-based emails with dynamic data.
 */
export interface EmailJobData extends BaseJobData {
  /** Recipient email address */
  to: string;
  /** Additional recipients (CC) */
  cc?: string[];
  /** Hidden recipients (BCC) */
  bcc?: string[];
  /** Email subject line */
  subject: string;
  /** Email template name (for template-based emails) */
  template?: string;
  /** Plain text email body (for simple emails) */
  body?: string;
  /** HTML email body (for rich emails) */
  htmlBody?: string;
  /** Dynamic data to populate in the email template */
  templateData?: Record<string, any>;
  /** Email priority (1-10, higher = more important) */
  priority?: number;
  /** Attachments to include with the email */
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

/**
 * Webhook Processing Job Data
 * 
 * Used for processing incoming webhooks from Shopify or other services.
 * This allows us to handle webhook processing asynchronously.
 */
export interface WebhookJobData extends BaseJobData {
  /** Source of the webhook (shopify, stripe, etc.) */
  source: 'shopify' | 'stripe' | 'custom';
  /** Type of webhook event */
  eventType: string;
  /** The webhook payload data */
  payload: Record<string, any>;
  /** HTTP headers from the webhook request */
  headers?: Record<string, string>;
  /** Webhook signature for verification */
  signature?: string;
  /** Retry attempt number (used internally) */
  attemptNumber?: number;
}

/**
 * Shopify-specific Webhook Job Data
 * 
 * Specialized webhook data for Shopify events with known structure
 */
export interface ShopifyWebhookJobData extends BaseJobData {
  /** Shopify webhook topic (orders/create, products/update, etc.) */
  topic: string;
  /** Shopify shop domain */
  shopDomain: string;
  /** Shopify webhook data */
  shopifyData: {
    /** Order data for order-related webhooks */
    order?: {
      id: string;
      email: string;
      total_price: string;
      line_items: Array<{
        id: string;
        product_id: string;
        variant_id: string;
        title: string;
        quantity: number;
        price: string;
      }>;
    };
    /** Product data for product-related webhooks */
    product?: {
      id: string;
      title: string;
      handle: string;
      vendor: string;
      variants: Array<{
        id: string;
        title: string;
        price: string;
        sku: string;
      }>;
    };
  };
}

/**
 * Product Synchronization Job Data
 * 
 * Used for syncing products between Shopify and our local database
 */
export interface ProductSyncJobData extends BaseJobData {
  /** Shopify product ID to sync */
  shopifyProductId: string;
  /** Shopify variant ID (if syncing specific variant) */
  shopifyVariantId?: string;
  /** Type of sync operation */
  action: 'create' | 'update' | 'delete' | 'full-sync';
  /** Force sync even if already up to date */
  forceSync?: boolean;
  /** Shop domain for multi-store setups */
  shopDomain?: string;
  /** Additional sync options */
  syncOptions?: {
    /** Whether to sync inventory levels */
    syncInventory?: boolean;
    /** Whether to sync product images */
    syncImages?: boolean;
    /** Whether to sync metafields */
    syncMetafields?: boolean;
  };
}

/**
 * Background Task Job Data
 * 
 * Used for general background processing tasks that don't fit other categories
 */
export interface BackgroundTaskJobData extends BaseJobData {
  /** Type of background task */
  taskType: 'cleanup' | 'report-generation' | 'data-export' | 'maintenance' | 'custom';
  /** Task-specific parameters */
  parameters: Record<string, any>;
  /** Task deadline (if applicable) */
  deadline?: Date;
  /** Whether this task can be cancelled */
  cancellable?: boolean;
}

/**
 * Order Processing Job Data
 * 
 * Used for complex order processing that needs to happen asynchronously
 */
export interface OrderProcessingJobData extends BaseJobData {
  /** Order ID in our system */
  orderId: number;
  /** Shopify order ID */
  shopifyOrderId: string;
  /** Processing action to perform */
  action: 'process-payment' | 'fulfill-order' | 'send-confirmation' | 'update-inventory' | 'cancel-order';
  /** Order data snapshot */
  orderData: {
    customerEmail: string;
    totalAmount: number;
    currency: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  };
  /** Processing options */
  options?: {
    /** Whether to send customer notifications */
    sendNotifications?: boolean;
    /** Whether to update inventory levels */
    updateInventory?: boolean;
    /** Custom processing parameters */
    customParams?: Record<string, any>;
  };
}

/**
 * Notification Job Data
 * 
 * Used for sending various types of notifications (SMS, push, webhooks)
 */
export interface NotificationJobData extends BaseJobData {
  /** Type of notification */
  type: 'sms' | 'push' | 'webhook' | 'slack';
  /** Recipient information */
  recipient: {
    /** Phone number for SMS */
    phone?: string;
    /** Device token for push notifications */
    deviceToken?: string;
    /** Webhook URL for webhook notifications */
    webhookUrl?: string;
    /** Slack channel for Slack notifications */
    slackChannel?: string;
  };
  /** Notification message */
  message: string;
  /** Additional notification data */
  data?: Record<string, any>;
  /** Notification urgency level */
  urgency?: 'low' | 'normal' | 'high' | 'critical';
}

/**
 * Union type of all possible job data types
 * 
 * This union type helps with type checking when processing jobs generically
 */
export type JobData = 
  | EmailJobData
  | WebhookJobData
  | ShopifyWebhookJobData
  | ProductSyncJobData
  | BackgroundTaskJobData
  | OrderProcessingJobData
  | NotificationJobData;

/**
 * Job Result Types
 * 
 * These interfaces define what successful job processing should return
 */
export interface JobResult {
  /** Whether the job was successful */
  success: boolean;
  /** Result message */
  message: string;
  /** Processing timestamp */
  processedAt: Date;
  /** Additional result data */
  data?: Record<string, any>;
  /** Processing duration in milliseconds */
  duration?: number;
}

/**
 * Job Error Types
 * 
 * Standardized error information for failed jobs
 */
export interface JobError {
  /** Error message */
  message: string;
  /** Error code for categorization */
  code?: string;
  /** Whether this error is retryable */
  retryable: boolean;
  /** Stack trace (in development) */
  stack?: string;
  /** Additional error context */
  context?: Record<string, any>;
}

/**
 * Queue Names
 * 
 * Centralized queue name constants to avoid typos and ensure consistency
 */
export const QUEUE_NAMES = {
  EMAIL: 'email',
  WEBHOOK: 'webhook-processing',
  PRODUCT_SYNC: 'product-sync',
  BACKGROUND: 'background-tasks',
  ORDER_PROCESSING: 'order-processing',
  NOTIFICATIONS: 'notifications',
} as const;

/**
 * Job Names
 * 
 * Centralized job name constants for each queue
 */
export const JOB_NAMES = {
  // Email jobs
  SEND_EMAIL: 'send-email',
  SEND_BULK_EMAIL: 'send-bulk-email',
  
  // Webhook jobs
  PROCESS_WEBHOOK: 'process-webhook',
  VERIFY_WEBHOOK: 'verify-webhook',
  
  // Product sync jobs
  SYNC_PRODUCT: 'sync-product',
  SYNC_ALL_PRODUCTS: 'sync-all-products',
  
  // Background jobs
  CLEANUP_DATA: 'cleanup-data',
  GENERATE_REPORT: 'generate-report',
  
  // Order processing jobs
  PROCESS_ORDER: 'process-order',
  FULFILL_ORDER: 'fulfill-order',
  
  // Notification jobs
  SEND_NOTIFICATION: 'send-notification',
} as const; 