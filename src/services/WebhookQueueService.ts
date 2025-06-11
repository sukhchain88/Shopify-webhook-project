import { SimpleQueueService } from './SimpleQueueService';

/**
 * Webhook Queue Service
 * 
 * Replaces BullMQ for webhook processing on Render free tier.
 * Uses database-based queuing instead of Redis.
 */

export class WebhookQueueService {
  
  /**
   * Queue a webhook for processing
   */
  static async queueWebhook(webhookData: {
    topic: string;
    shop_domain: string;
    data: any;
    headers: Record<string, string>;
  }) {
    return await SimpleQueueService.addJob('process_webhook', webhookData, {
      maxAttempts: 5, // Important webhooks get more retries
    });
  }

  /**
   * Queue an email
   */
  static async queueEmail(emailData: {
    to: string;
    subject: string;
    body?: string;
    htmlBody?: string;
    template?: string;
    templateData?: any;
  }) {
    return await SimpleQueueService.addJob('send_email', emailData, {
      maxAttempts: 3,
    });
  }

  /**
   * Queue product sync
   */
  static async queueProductSync(productData: {
    productId: string;
    shopDomain: string;
    action: 'create' | 'update' | 'delete';
  }) {
    return await SimpleQueueService.addJob('sync_product', productData, {
      maxAttempts: 2,
      delayMs: 1000, // Small delay to batch operations
    });
  }

  /**
   * Queue notification
   */
  static async queueNotification(notificationData: {
    type: 'sms' | 'push' | 'slack';
    recipient: string;
    message: string;
    urgency: 'low' | 'medium' | 'high';
  }) {
    const delayMs = notificationData.urgency === 'high' ? 0 : 5000;
    
    return await SimpleQueueService.addJob('send_notification', notificationData, {
      maxAttempts: 3,
      delayMs,
    });
  }

  /**
   * Process webhook immediately (for urgent webhooks)
   */
  static async processWebhookImmediately(webhookData: any) {
    try {
      console.log(`[Webhook] Processing immediately: ${webhookData.topic}`);
      
      // Process webhook logic here
      switch (webhookData.topic) {
        case 'orders/create':
          await this.handleOrderCreate(webhookData.data);
          break;
        case 'orders/updated':
          await this.handleOrderUpdate(webhookData.data);
          break;
        case 'products/create':
          await this.handleProductCreate(webhookData.data);
          break;
        case 'products/update':
          await this.handleProductUpdate(webhookData.data);
          break;
        default:
          console.log(`[Webhook] Unknown webhook topic: ${webhookData.topic}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('[Webhook] Immediate processing failed:', error);
      
      // Fallback to queue if immediate processing fails
      await this.queueWebhook(webhookData);
      
      throw error;
    }
  }

  // Webhook handlers
  private static async handleOrderCreate(orderData: any) {
    console.log(`[Webhook] New order created: ${orderData.id}`);
    // Implement order creation logic
  }

  private static async handleOrderUpdate(orderData: any) {
    console.log(`[Webhook] Order updated: ${orderData.id}`);
    // Implement order update logic
  }

  private static async handleProductCreate(productData: any) {
    console.log(`[Webhook] New product created: ${productData.id}`);
    // Implement product creation logic
  }

  private static async handleProductUpdate(productData: any) {
    console.log(`[Webhook] Product updated: ${productData.id}`);
    // Implement product update logic
  }
} 