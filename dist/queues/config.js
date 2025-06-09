"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironmentConfig = exports.workerConfig = exports.queueConfigs = exports.defaultJobOptions = exports.redisConnection = void 0;
/**
 * Redis Connection Configuration
 *
 * This configuration handles the connection to Redis which is required for BullMQ.
 * Redis acts as the message broker that stores job data and manages the queue state.
 */
exports.redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    // Connection retry settings
    maxRetriesPerRequest: 3,
    lazyConnect: true, // Don't connect immediately, wait for first command
};
/**
 * Default Job Options for All Queues
 *
 * These options define how jobs behave by default across all queues.
 * Individual jobs can override these settings when needed.
 */
exports.defaultJobOptions = {
    // Job Retention Settings
    removeOnComplete: 10, // Keep only last 10 completed jobs for monitoring
    removeOnFail: 50, // Keep 50 failed jobs for debugging purposes
    // Retry Configuration
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
        type: 'exponential', // Use exponential backoff (2s, 4s, 8s...)
        delay: 2000, // Start with 2 second delay
    },
};
/**
 * Queue-Specific Configurations
 *
 * Different queues may need different configurations based on their workload
 * and priority requirements.
 */
exports.queueConfigs = {
    // High priority queue for critical operations like webhook processing
    webhook: {
        ...exports.defaultJobOptions,
        attempts: 5, // More retries for critical webhooks
        priority: 10, // Higher priority
    },
    // Email queue configuration
    email: {
        ...exports.defaultJobOptions,
        attempts: 3, // Standard retries for emails
        priority: 5, // Medium priority
    },
    // Product sync queue for Shopify product synchronization
    productSync: {
        ...exports.defaultJobOptions,
        attempts: 2, // Fewer retries for product sync
        priority: 1, // Lower priority (can wait)
    },
    // Background tasks queue for non-critical operations
    background: {
        ...exports.defaultJobOptions,
        attempts: 1, // Single attempt for background tasks
        priority: 0, // Lowest priority
    },
};
/**
 * Worker Configuration
 *
 * These settings control how workers process jobs from the queues.
 */
exports.workerConfig = {
    // Concurrency settings - how many jobs to process simultaneously
    concurrency: {
        webhook: 3, // Process 3 webhook jobs at once
        email: 5, // Process 5 email jobs at once
        productSync: 2, // Process 2 product sync jobs at once
        background: 1, // Process 1 background job at a time
    },
    // Worker connection settings
    connection: exports.redisConnection,
    // Stalledcheck interval - how often to check for stalled jobs
    stalledInterval: 30000, // 30 seconds
    maxStalledCount: 1, // Mark jobs as failed after 1 stall
};
/**
 * Environment-specific configurations
 */
const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    switch (env) {
        case 'production':
            return {
                ...exports.defaultJobOptions,
                removeOnComplete: 50, // Keep more completed jobs in production
                removeOnFail: 100, // Keep more failed jobs for analysis
            };
        case 'test':
            return {
                ...exports.defaultJobOptions,
                removeOnComplete: 1, // Minimal retention in tests
                removeOnFail: 1,
                attempts: 1, // No retries in tests for faster execution
            };
        default: // development
            return exports.defaultJobOptions;
    }
};
exports.getEnvironmentConfig = getEnvironmentConfig;
