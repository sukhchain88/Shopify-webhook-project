import { Queue } from 'bullmq';
import { redisConnection, queueConfigs } from './config';
import { 
  EmailJobData, 
  WebhookJobData, 
  ShopifyWebhookJobData,
  ProductSyncJobData, 
  BackgroundTaskJobData,
  OrderProcessingJobData,
  NotificationJobData,
  QUEUE_NAMES 
} from './types';

/**
 * Queue Registry
 * 
 * This file creates and exports all the queues used in our application.
 * Each queue is typed with its specific job data interface and configured
 * with appropriate settings for its workload.
 */

/**
 * Email Queue
 * 
 * Handles all email-related jobs including:
 * - Order confirmations
 * - Password resets
 * - Marketing emails
 * - System notifications
 */
export const emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.EMAIL, {
  connection: redisConnection,
  defaultJobOptions: queueConfigs.email,
});

/**
 * Webhook Processing Queue
 * 
 * Handles incoming webhooks from external services:
 * - Shopify webhooks (orders, products, customers)
 * - Payment gateway webhooks
 * - Third-party service notifications
 */
export const webhookQueue = new Queue<WebhookJobData>(QUEUE_NAMES.WEBHOOK, {
  connection: redisConnection,
  defaultJobOptions: queueConfigs.webhook,
});

/**
 * Product Synchronization Queue
 * 
 * Manages product data synchronization:
 * - Shopify product imports
 * - Inventory updates
 * - Price synchronization
 * - Product metadata updates
 */
export const productSyncQueue = new Queue<ProductSyncJobData>(QUEUE_NAMES.PRODUCT_SYNC, {
  connection: redisConnection,
  defaultJobOptions: queueConfigs.productSync,
});

/**
 * Background Tasks Queue
 * 
 * Handles long-running background operations:
 * - Data cleanup and maintenance
 * - Report generation
 * - Bulk data exports
 * - System maintenance tasks
 */
export const backgroundQueue = new Queue<BackgroundTaskJobData>(QUEUE_NAMES.BACKGROUND, {
  connection: redisConnection,
  defaultJobOptions: queueConfigs.background,
});

/**
 * Order Processing Queue
 * 
 * Handles complex order-related operations:
 * - Order fulfillment
 * - Payment processing
 * - Inventory adjustments
 * - Customer notifications
 */
export const orderProcessingQueue = new Queue<OrderProcessingJobData>(QUEUE_NAMES.ORDER_PROCESSING, {
  connection: redisConnection,
  defaultJobOptions: queueConfigs.webhook, // Use webhook config for high priority
});

/**
 * Notifications Queue
 * 
 * Handles various notification types:
 * - SMS notifications
 * - Push notifications
 * - Slack alerts
 * - Webhook notifications
 */
export const notificationQueue = new Queue<NotificationJobData>(QUEUE_NAMES.NOTIFICATIONS, {
  connection: redisConnection,
  defaultJobOptions: queueConfigs.email, // Use email config for moderate priority
});

/**
 * Queues Registry Object
 * 
 * Centralized access to all queues for easy management and monitoring.
 * This object provides typed access to all queues and is used by the
 * QueueService for job scheduling.
 */
export const queues = {
  email: emailQueue,
  webhook: webhookQueue,
  productSync: productSyncQueue,
  background: backgroundQueue,
  orderProcessing: orderProcessingQueue,
  notifications: notificationQueue,
} as const;

/**
 * Queue Names Array
 * 
 * Used for iterating over all queues for monitoring and management
 */
export const queueNames = Object.keys(queues) as Array<keyof typeof queues>;

/**
 * Queue Health Check Function
 * 
 * Checks the health status of all queues by verifying Redis connection
 * and basic queue operations.
 */
export async function checkQueueHealth(): Promise<{
  healthy: boolean;
  queues: Record<string, { connected: boolean; error?: string }>;
}> {
  const results: Record<string, { connected: boolean; error?: string }> = {};
  let allHealthy = true;

  for (const [name, queue] of Object.entries(queues)) {
    try {
      // Test basic queue operation
      await queue.getWaiting();
      results[name] = { connected: true };
    } catch (error) {
      results[name] = { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      allHealthy = false;
    }
  }

  return {
    healthy: allHealthy,
    queues: results,
  };
}

/**
 * Get Queue Statistics
 * 
 * Returns comprehensive statistics for all queues including:
 * - Job counts by status
 * - Processing rates
 * - Error rates
 */
export async function getQueueStatistics() {
  const statistics: Record<string, any> = {};

  for (const [name, queue] of Object.entries(queues)) {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      statistics[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };
    } catch (error) {
      statistics[name] = {
        error: error instanceof Error ? error.message : 'Failed to get statistics',
      };
    }
  }

  return statistics;
}

/**
 * Pause All Queues
 * 
 * Utility function to pause all queues - useful for maintenance
 */
export async function pauseAllQueues(): Promise<void> {
  const pausePromises = Object.values(queues).map(queue => queue.pause());
  await Promise.all(pausePromises);
}

/**
 * Resume All Queues
 * 
 * Utility function to resume all queues after maintenance
 */
export async function resumeAllQueues(): Promise<void> {
  const resumePromises = Object.values(queues).map(queue => queue.resume());
  await Promise.all(resumePromises);
}

/**
 * Clean All Queues
 * 
 * Removes old completed and failed jobs from all queues
 */
export async function cleanAllQueues(olderThan: number = 24 * 60 * 60 * 1000): Promise<void> {
  const cleanPromises = Object.values(queues).map(queue => 
    Promise.all([
      queue.clean(olderThan, 10, 'completed'),
      queue.clean(olderThan, 50, 'failed'),
    ])
  );
  await Promise.all(cleanPromises);
}

/**
 * Graceful Shutdown
 * 
 * Properly closes all queue connections during application shutdown
 */
export async function shutdownQueues(): Promise<void> {
  console.log('Shutting down queues...');
  
  const closePromises = Object.entries(queues).map(async ([name, queue]) => {
    try {
      await queue.close();
      console.log(`Queue ${name} closed successfully`);
    } catch (error) {
      console.error(`Error closing queue ${name}:`, error);
    }
  });

  await Promise.all(closePromises);
  console.log('All queues shut down');
}

// Handle graceful shutdown on process termination
process.on('SIGTERM', shutdownQueues);
process.on('SIGINT', shutdownQueues); 