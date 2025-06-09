"use strict";
/**
 * Job Data Type Definitions
 *
 * This file contains all the TypeScript interfaces for different types of jobs
 * that can be processed by our queue system. This ensures type safety and
 * makes it clear what data each job type expects.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_NAMES = exports.QUEUE_NAMES = void 0;
/**
 * Queue Names
 *
 * Centralized queue name constants to avoid typos and ensure consistency
 */
exports.QUEUE_NAMES = {
    EMAIL: 'email',
    WEBHOOK: 'webhook-processing',
    PRODUCT_SYNC: 'product-sync',
    BACKGROUND: 'background-tasks',
    ORDER_PROCESSING: 'order-processing',
    NOTIFICATIONS: 'notifications',
};
/**
 * Job Names
 *
 * Centralized job name constants for each queue
 */
exports.JOB_NAMES = {
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
};
