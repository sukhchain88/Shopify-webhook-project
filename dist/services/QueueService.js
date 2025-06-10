import { queues } from '../queues/index.js';
import { JOB_NAMES } from '../queues/types.js';
/**
 * Queue Service
 *
 * This service provides a clean, type-safe API for interacting with job queues.
 * It abstracts the complexity of BullMQ and provides convenient methods for
 * scheduling different types of jobs.
 *
 * Key Benefits:
 * - Type safety for all job data
 * - Consistent error handling
 * - Easy job scheduling and management
 * - Batch operations support
 * - Queue monitoring utilities
 */
export class QueueService {
    // ===========================================
    // EMAIL QUEUE OPERATIONS
    // ===========================================
    /**
     * Send Email Job
     *
     * Schedules an email to be sent asynchronously
     *
     * @param data Email job data
     * @param options Optional job configuration
     */
    static async sendEmail(data, options) {
        console.log(`[Queue Service] Scheduling email job for ${data.to}`);
        try {
            const job = await queues.email.add(JOB_NAMES.SEND_EMAIL, data, {
                priority: data.priority || 5,
                ...options,
            });
            console.log(`[Queue Service] Email job scheduled successfully:`, {
                jobId: job.id,
                to: data.to,
                subject: data.subject,
            });
            return job;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to schedule email job:`, error);
            throw new Error(`Failed to schedule email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Send Bulk Emails
     *
     * Schedules multiple emails to be sent with staggered timing to avoid rate limits
     */
    static async sendBulkEmails(emails, options) {
        console.log(`[Queue Service] Scheduling ${emails.length} bulk email jobs`);
        try {
            const { delayBetween = 100, priority = 3 } = options || {};
            const jobs = emails.map((email, index) => ({
                name: JOB_NAMES.SEND_EMAIL,
                data: email,
                opts: {
                    delay: index * delayBetween,
                    priority: email.priority || priority,
                },
            }));
            const scheduledJobs = await queues.email.addBulk(jobs);
            console.log(`[Queue Service] ${scheduledJobs.length} bulk email jobs scheduled successfully`);
            return scheduledJobs;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to schedule bulk emails:`, error);
            throw new Error(`Failed to schedule bulk emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Schedule Email for Later
     *
     * Schedules an email to be sent at a specific time
     */
    static async scheduleEmail(data, scheduleTime, options) {
        const delay = scheduleTime.getTime() - Date.now();
        if (delay <= 0) {
            throw new Error('Schedule time must be in the future');
        }
        console.log(`[Queue Service] Scheduling email for ${scheduleTime.toISOString()}`);
        return await this.sendEmail(data, {
            delay,
            ...options
        });
    }
    // ===========================================
    // WEBHOOK QUEUE OPERATIONS
    // ===========================================
    /**
     * Process Webhook Job
     *
     * Schedules a webhook to be processed asynchronously
     */
    static async processWebhook(data, options) {
        console.log(`[Queue Service] Scheduling webhook job:`, {
            source: data.source,
            eventType: data.eventType,
        });
        try {
            const job = await queues.webhook.add(JOB_NAMES.PROCESS_WEBHOOK, data, {
                priority: 10, // High priority for webhooks
                ...options,
            });
            console.log(`[Queue Service] Webhook job scheduled successfully:`, {
                jobId: job.id,
                source: data.source,
                eventType: data.eventType,
            });
            return job;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to schedule webhook job:`, error);
            throw new Error(`Failed to schedule webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Process Shopify Webhook
     *
     * Convenience method for Shopify webhooks with proper typing
     */
    static async processShopifyWebhook(data, options) {
        const webhookData = {
            source: 'shopify',
            eventType: data.topic,
            payload: data.shopifyData,
            ...data,
        };
        return await this.processWebhook(webhookData, options);
    }
    // ===========================================
    // PRODUCT SYNC QUEUE OPERATIONS
    // ===========================================
    /**
     * Sync Product
     *
     * Schedules a product synchronization job
     */
    static async syncProduct(data, options) {
        console.log(`[Queue Service] Scheduling product sync job:`, {
            shopifyProductId: data.shopifyProductId,
            action: data.action,
        });
        try {
            const job = await queues.productSync.add(JOB_NAMES.SYNC_PRODUCT, data, {
                priority: 2,
                ...options,
            });
            console.log(`[Queue Service] Product sync job scheduled successfully:`, {
                jobId: job.id,
                shopifyProductId: data.shopifyProductId,
            });
            return job;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to schedule product sync job:`, error);
            throw new Error(`Failed to schedule product sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Sync All Products
     *
     * Schedules a full product catalog synchronization
     */
    static async syncAllProducts(shopDomain, options) {
        console.log(`[Queue Service] Scheduling full product sync for shop: ${shopDomain || 'default'}`);
        const data = {
            shopifyProductId: 'all',
            action: 'full-sync',
            shopDomain,
            forceSync: true,
        };
        return await queues.productSync.add(JOB_NAMES.SYNC_ALL_PRODUCTS, data, {
            priority: 1,
            ...options,
        });
    }
    // ===========================================
    // BACKGROUND TASKS QUEUE OPERATIONS
    // ===========================================
    /**
     * Schedule Background Task
     *
     * Schedules a general background task
     */
    static async scheduleBackgroundTask(data, options) {
        console.log(`[Queue Service] Scheduling background task:`, {
            taskType: data.taskType,
        });
        try {
            const job = await queues.background.add(`background-${data.taskType}`, data, {
                priority: 0, // Low priority
                ...options,
            });
            console.log(`[Queue Service] Background task scheduled successfully:`, {
                jobId: job.id,
                taskType: data.taskType,
            });
            return job;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to schedule background task:`, error);
            throw new Error(`Failed to schedule background task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Schedule Data Cleanup
     *
     * Schedules a data cleanup task
     */
    static async scheduleDataCleanup(parameters = {}, options) {
        const data = {
            taskType: 'cleanup',
            parameters: {
                olderThan: 30, // days
                tables: ['orders', 'order_items', 'logs'],
                ...parameters,
            },
        };
        return await this.scheduleBackgroundTask(data, options);
    }
    // ===========================================
    // ORDER PROCESSING QUEUE OPERATIONS
    // ===========================================
    /**
     * Process Order
     *
     * Schedules order processing job
     */
    static async processOrder(data, options) {
        console.log(`[Queue Service] Scheduling order processing job:`, {
            orderId: data.orderId,
            action: data.action,
        });
        try {
            const job = await queues.orderProcessing.add(JOB_NAMES.PROCESS_ORDER, data, {
                priority: 8, // High priority for order processing
                ...options,
            });
            console.log(`[Queue Service] Order processing job scheduled successfully:`, {
                jobId: job.id,
                orderId: data.orderId,
            });
            return job;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to schedule order processing job:`, error);
            throw new Error(`Failed to schedule order processing: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ===========================================
    // NOTIFICATION QUEUE OPERATIONS
    // ===========================================
    /**
     * Send Notification
     *
     * Schedules a notification to be sent
     */
    static async sendNotification(data, options) {
        console.log(`[Queue Service] Scheduling notification job:`, {
            type: data.type,
            urgency: data.urgency,
        });
        try {
            const priority = this.getNotificationPriority(data.urgency);
            const job = await queues.notifications.add(JOB_NAMES.SEND_NOTIFICATION, data, {
                priority,
                ...options,
            });
            console.log(`[Queue Service] Notification job scheduled successfully:`, {
                jobId: job.id,
                type: data.type,
            });
            return job;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to schedule notification job:`, error);
            throw new Error(`Failed to schedule notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ===========================================
    // QUEUE MONITORING AND MANAGEMENT
    // ===========================================
    /**
     * Get Queue Statistics
     *
     * Returns comprehensive statistics for all queues
     */
    static async getQueueStatistics() {
        console.log(`[Queue Service] Fetching queue statistics`);
        try {
            const statistics = {};
            for (const [name, queue] of Object.entries(queues)) {
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
            return statistics;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to fetch queue statistics:`, error);
            throw new Error(`Failed to fetch queue statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get Job by ID
     *
     * Retrieves a specific job from any queue
     */
    static async getJob(queueName, jobId) {
        try {
            const queue = queues[queueName];
            if (!queue) {
                throw new Error(`Queue ${queueName} not found`);
            }
            const job = await queue.getJob(jobId);
            return job;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to get job ${jobId} from queue ${queueName}:`, error);
            throw new Error(`Failed to get job: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Retry Failed Job
     *
     * Retries a specific failed job
     */
    static async retryFailedJob(queueName, jobId) {
        try {
            const job = await this.getJob(queueName, jobId);
            if (!job) {
                throw new Error(`Job ${jobId} not found in queue ${queueName}`);
            }
            await job.retry();
            console.log(`[Queue Service] Job ${jobId} retried successfully`);
            return job;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to retry job ${jobId}:`, error);
            throw new Error(`Failed to retry job: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Clean Completed Jobs
     *
     * Removes old completed jobs from all queues
     */
    static async cleanCompletedJobs(olderThan = 24 * 60 * 60 * 1000) {
        console.log(`[Queue Service] Cleaning completed jobs older than ${olderThan}ms`);
        try {
            const cleanResults = [];
            for (const [name, queue] of Object.entries(queues)) {
                const cleaned = await queue.clean(olderThan, 0, 'completed');
                cleanResults.push({ queue: name, cleaned });
                console.log(`[Queue Service] Cleaned ${cleaned.length} completed jobs from ${name} queue`);
            }
            return cleanResults;
        }
        catch (error) {
            console.error(`[Queue Service] Failed to clean completed jobs:`, error);
            throw new Error(`Failed to clean completed jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Pause Queue
     *
     * Pauses job processing for a specific queue
     */
    static async pauseQueue(queueName) {
        try {
            const queue = queues[queueName];
            await queue.pause();
            console.log(`[Queue Service] Queue ${queueName} paused successfully`);
        }
        catch (error) {
            console.error(`[Queue Service] Failed to pause queue ${queueName}:`, error);
            throw new Error(`Failed to pause queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Resume Queue
     *
     * Resumes job processing for a specific queue
     */
    static async resumeQueue(queueName) {
        try {
            const queue = queues[queueName];
            await queue.resume();
            console.log(`[Queue Service] Queue ${queueName} resumed successfully`);
        }
        catch (error) {
            console.error(`[Queue Service] Failed to resume queue ${queueName}:`, error);
            throw new Error(`Failed to resume queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ===========================================
    // HELPER METHODS
    // ===========================================
    /**
     * Get Notification Priority
     *
     * Maps notification urgency to queue priority
     */
    static getNotificationPriority(urgency) {
        switch (urgency) {
            case 'critical': return 10;
            case 'high': return 7;
            case 'normal': return 5;
            case 'low': return 2;
            default: return 5;
        }
    }
    /**
     * Add Correlation ID
     *
     * Adds a correlation ID to job data for tracking
     */
    static addCorrelationId(data) {
        if (!data.correlationId) {
            data.correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        return data;
    }
    /**
     * Create Job Options
     *
     * Creates standardized job options with defaults
     */
    static createJobOptions(priority, delay, attempts) {
        return {
            priority: priority || 5,
            delay: delay || 0,
            attempts: attempts || 3,
            removeOnComplete: 10,
            removeOnFail: 50,
        };
    }
}
