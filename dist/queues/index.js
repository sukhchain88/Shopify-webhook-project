"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueNames = exports.queues = exports.notificationQueue = exports.orderProcessingQueue = exports.backgroundQueue = exports.productSyncQueue = exports.webhookQueue = exports.emailQueue = void 0;
exports.checkQueueHealth = checkQueueHealth;
exports.getQueueStatistics = getQueueStatistics;
exports.pauseAllQueues = pauseAllQueues;
exports.resumeAllQueues = resumeAllQueues;
exports.cleanAllQueues = cleanAllQueues;
exports.shutdownQueues = shutdownQueues;
const bullmq_1 = require("bullmq");
const config_1 = require("./config");
const types_1 = require("./types");
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
exports.emailQueue = new bullmq_1.Queue(types_1.QUEUE_NAMES.EMAIL, {
    connection: config_1.redisConnection,
    defaultJobOptions: config_1.queueConfigs.email,
});
/**
 * Webhook Processing Queue
 *
 * Handles incoming webhooks from external services:
 * - Shopify webhooks (orders, products, customers)
 * - Payment gateway webhooks
 * - Third-party service notifications
 */
exports.webhookQueue = new bullmq_1.Queue(types_1.QUEUE_NAMES.WEBHOOK, {
    connection: config_1.redisConnection,
    defaultJobOptions: config_1.queueConfigs.webhook,
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
exports.productSyncQueue = new bullmq_1.Queue(types_1.QUEUE_NAMES.PRODUCT_SYNC, {
    connection: config_1.redisConnection,
    defaultJobOptions: config_1.queueConfigs.productSync,
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
exports.backgroundQueue = new bullmq_1.Queue(types_1.QUEUE_NAMES.BACKGROUND, {
    connection: config_1.redisConnection,
    defaultJobOptions: config_1.queueConfigs.background,
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
exports.orderProcessingQueue = new bullmq_1.Queue(types_1.QUEUE_NAMES.ORDER_PROCESSING, {
    connection: config_1.redisConnection,
    defaultJobOptions: config_1.queueConfigs.webhook, // Use webhook config for high priority
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
exports.notificationQueue = new bullmq_1.Queue(types_1.QUEUE_NAMES.NOTIFICATIONS, {
    connection: config_1.redisConnection,
    defaultJobOptions: config_1.queueConfigs.email, // Use email config for moderate priority
});
/**
 * Queues Registry Object
 *
 * Centralized access to all queues for easy management and monitoring.
 * This object provides typed access to all queues and is used by the
 * QueueService for job scheduling.
 */
exports.queues = {
    email: exports.emailQueue,
    webhook: exports.webhookQueue,
    productSync: exports.productSyncQueue,
    background: exports.backgroundQueue,
    orderProcessing: exports.orderProcessingQueue,
    notifications: exports.notificationQueue,
};
/**
 * Queue Names Array
 *
 * Used for iterating over all queues for monitoring and management
 */
exports.queueNames = Object.keys(exports.queues);
/**
 * Queue Health Check Function
 *
 * Checks the health status of all queues by verifying Redis connection
 * and basic queue operations.
 */
async function checkQueueHealth() {
    const results = {};
    let allHealthy = true;
    for (const [name, queue] of Object.entries(exports.queues)) {
        try {
            // Test basic queue operation
            await queue.getWaiting();
            results[name] = { connected: true };
        }
        catch (error) {
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
async function getQueueStatistics() {
    const statistics = {};
    for (const [name, queue] of Object.entries(exports.queues)) {
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
        }
        catch (error) {
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
async function pauseAllQueues() {
    const pausePromises = Object.values(exports.queues).map(queue => queue.pause());
    await Promise.all(pausePromises);
}
/**
 * Resume All Queues
 *
 * Utility function to resume all queues after maintenance
 */
async function resumeAllQueues() {
    const resumePromises = Object.values(exports.queues).map(queue => queue.resume());
    await Promise.all(resumePromises);
}
/**
 * Clean All Queues
 *
 * Removes old completed and failed jobs from all queues
 */
async function cleanAllQueues(olderThan = 24 * 60 * 60 * 1000) {
    const cleanPromises = Object.values(exports.queues).map(queue => Promise.all([
        queue.clean(olderThan, 10, 'completed'),
        queue.clean(olderThan, 50, 'failed'),
    ]));
    await Promise.all(cleanPromises);
}
/**
 * Graceful Shutdown
 *
 * Properly closes all queue connections during application shutdown
 */
async function shutdownQueues() {
    console.log('Shutting down queues...');
    const closePromises = Object.entries(exports.queues).map(async ([name, queue]) => {
        try {
            await queue.close();
            console.log(`Queue ${name} closed successfully`);
        }
        catch (error) {
            console.error(`Error closing queue ${name}:`, error);
        }
    });
    await Promise.all(closePromises);
    console.log('All queues shut down');
}
// Handle graceful shutdown on process termination
process.on('SIGTERM', shutdownQueues);
process.on('SIGINT', shutdownQueues);
