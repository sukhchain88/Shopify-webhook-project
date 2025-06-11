/**
 * Free Tier Queue System Example
 * 
 * This example shows how to replace BullMQ with a database-based queue
 * system that works perfectly with Render's free tier.
 */

import { SimpleQueueService } from '../src/services/SimpleQueueService';
import { WebhookQueueService } from '../src/services/WebhookQueueService';

// 1. Initialize the queue processor in your main app
export function initializeQueue() {
  // Start processing jobs every 5 seconds
  SimpleQueueService.startProcessor(5000);
  
  console.log('✅ Database-based queue system initialized for free tier');
}

// 2. Replace BullMQ webhook processing
export async function handleShopifyWebhook(req: any, res: any) {
  try {
    const webhookData = {
      topic: req.headers['x-shopify-topic'] || 'unknown',
      shop_domain: req.headers['x-shopify-shop-domain'] || 'unknown',
      data: req.body,
      headers: req.headers,
    };

    // Strategy 1: Process immediately for critical webhooks
    if (webhookData.topic === 'orders/create') {
      try {
        await WebhookQueueService.processWebhookImmediately(webhookData);
        res.status(200).send('OK');
      } catch (error) {
        // Fallback to queue if immediate processing fails
        await WebhookQueueService.queueWebhook(webhookData);
        res.status(200).send('Queued');
      }
    } else {
      // Strategy 2: Queue for background processing
      await WebhookQueueService.queueWebhook(webhookData);
      res.status(200).send('OK');
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error');
  }
}

// 3. Replace email queue operations
export async function sendOrderConfirmationEmail(orderData: any) {
  await WebhookQueueService.queueEmail({
    to: orderData.customer.email,
    subject: `Order Confirmation #${orderData.order_number}`,
    template: 'order-confirmation',
    templateData: {
      orderNumber: orderData.order_number,
      customerName: orderData.customer.first_name,
      total: orderData.total_price,
      items: orderData.line_items,
    },
  });
}

// 4. Bulk operations (great for free tier)
export async function sendBulkEmails(emails: any[]) {
  const emailJobs = emails.map(email => ({
    type: 'send_email',
    payload: email,
    delayMs: Math.random() * 1000, // Spread out emails
  }));

  await SimpleQueueService.addBulkJobs(emailJobs);
  console.log(`Queued ${emails.length} emails for sending`);
}

// 5. Product sync operations
export async function syncProductFromShopify(productData: any) {
  await WebhookQueueService.queueProductSync({
    productId: productData.id,
    shopDomain: productData.shop_domain,
    action: 'update',
  });
}

// 6. Monitoring and cleanup (run periodically)
export async function monitorQueueHealth() {
  const stats = await SimpleQueueService.getStats();
  
  console.log('📊 Queue Statistics:', {
    pending: stats.pending,
    processing: stats.processing,
    completed: stats.completed,
    failed: stats.failed,
    total: stats.total,
  });

  // Clean up old jobs
  if (stats.completed > 1000) {
    await SimpleQueueService.cleanup(24); // Clean jobs older than 24 hours
  }

  return stats;
}

// 7. Graceful shutdown
export function shutdownQueue() {
  SimpleQueueService.stopProcessor();
  console.log('✅ Queue processor stopped');
}

// 8. Example integration in your main app
export function integrateWithApp(app: any) {
  // Initialize queue when app starts
  initializeQueue();

  // Replace BullMQ webhook endpoints
  app.post('/webhooks/shopify', handleShopifyWebhook);

  // Health check endpoint
  app.get('/queue/health', async (req: any, res: any) => {
    const stats = await monitorQueueHealth();
    res.json({
      healthy: stats.processing < 100, // Consider unhealthy if too many processing
      stats,
    });
  });

  // Queue stats endpoint
  app.get('/queue/stats', async (req: any, res: any) => {
    const stats = await SimpleQueueService.getStats();
    res.json(stats);
  });

  // Cleanup endpoint (can be called by cron jobs)
  app.post('/queue/cleanup', async (req: any, res: any) => {
    const deleted = await SimpleQueueService.cleanup(24);
    res.json({ deleted });
  });

  // Graceful shutdown
  process.on('SIGTERM', shutdownQueue);  
  process.on('SIGINT', shutdownQueue);
}

// 9. Free tier optimization tips
export const FreeTierTips = {
  // Process jobs immediately when possible
  processImmediately: true,
  
  // Use shorter polling intervals when app is active
  activePollingInterval: 3000,
  
  // Use longer intervals when app might be idle
  idlePollingInterval: 10000,
  
  // Batch operations to reduce database calls
  batchSize: 10,
  
  // Clean up regularly to keep database small
  cleanupInterval: '0 2 * * *', // Daily at 2 AM
  
  // Priorities for different job types
  priorities: {
    'process_webhook': 1,    // Highest priority
    'send_email': 2,         // Medium priority  
    'sync_product': 3,       // Lower priority
    'send_notification': 4,  // Lowest priority
  }
};

export default {
  initializeQueue,
  handleShopifyWebhook,
  sendOrderConfirmationEmail,
  sendBulkEmails,
  syncProductFromShopify,
  monitorQueueHealth,
  shutdownQueue,
  integrateWithApp,
  FreeTierTips,
}; 