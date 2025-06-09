"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allWorkers = exports.notificationWorker = exports.orderProcessingWorker = exports.backgroundWorker = exports.productSyncWorker = exports.webhookWorker = exports.emailWorker = void 0;
exports.shutdownWorkers = shutdownWorkers;
exports.getWorkerStatus = getWorkerStatus;
exports.pauseAllWorkers = pauseAllWorkers;
exports.resumeAllWorkers = resumeAllWorkers;
const bullmq_1 = require("bullmq");
const config_1 = require("../queues/config");
const types_1 = require("../queues/types");
const email_processor_1 = require("../jobs/processors/email.processor");
const webhook_processor_1 = require("../jobs/processors/webhook.processor");
/**
 * BullMQ Workers Setup
 *
 * This file creates and configures workers for all queues in the system.
 * Workers are responsible for processing jobs from their respective queues.
 *
 * Key Features:
 * - Concurrent job processing
 * - Comprehensive error handling
 * - Progress tracking
 * - Event logging
 * - Graceful shutdown
 */
/**
 * Email Worker
 *
 * Processes email-related jobs with high concurrency for better throughput
 */
exports.emailWorker = new bullmq_1.Worker(types_1.QUEUE_NAMES.EMAIL, async (job) => {
    console.log(`[Email Worker] Processing job ${job.id}: ${job.name}`);
    return await (0, email_processor_1.processEmailJob)(job);
}, {
    connection: config_1.redisConnection,
    concurrency: config_1.workerConfig.concurrency.email,
    stalledInterval: config_1.workerConfig.stalledInterval,
    maxStalledCount: config_1.workerConfig.maxStalledCount,
});
/**
 * Webhook Worker
 *
 * Processes webhook events with moderate concurrency to handle database operations safely
 */
exports.webhookWorker = new bullmq_1.Worker(types_1.QUEUE_NAMES.WEBHOOK, async (job) => {
    console.log(`[Webhook Worker] Processing job ${job.id}: ${job.name}`);
    return await (0, webhook_processor_1.processWebhookJob)(job);
}, {
    connection: config_1.redisConnection,
    concurrency: config_1.workerConfig.concurrency.webhook,
    stalledInterval: config_1.workerConfig.stalledInterval,
    maxStalledCount: config_1.workerConfig.maxStalledCount,
});
/**
 * Product Sync Worker
 *
 * Processes product synchronization jobs with limited concurrency to avoid API rate limits
 */
exports.productSyncWorker = new bullmq_1.Worker(types_1.QUEUE_NAMES.PRODUCT_SYNC, async (job) => {
    console.log(`[Product Sync Worker] Processing job ${job.id}: ${job.name}`);
    // Placeholder processor - implement based on your needs
    console.log(`[Product Sync Worker] Product sync job completed: ${job.id}`);
    return {
        success: true,
        message: 'Product sync completed',
        processedAt: new Date(),
        data: { jobId: job.id },
    };
}, {
    connection: config_1.redisConnection,
    concurrency: config_1.workerConfig.concurrency.productSync,
    stalledInterval: config_1.workerConfig.stalledInterval,
    maxStalledCount: config_1.workerConfig.maxStalledCount,
});
/**
 * Background Tasks Worker
 *
 * Processes background tasks with low concurrency to avoid impacting system performance
 */
exports.backgroundWorker = new bullmq_1.Worker(types_1.QUEUE_NAMES.BACKGROUND, async (job) => {
    console.log(`[Background Worker] Processing job ${job.id}: ${job.name}`);
    // Placeholder processor - implement based on your needs
    const { taskType, parameters } = job.data;
    switch (taskType) {
        case 'cleanup':
            await processCleanupTask(job, parameters);
            break;
        case 'report-generation':
            await processReportGeneration(job, parameters);
            break;
        default:
            console.log(`[Background Worker] Unknown task type: ${taskType}`);
    }
    return {
        success: true,
        message: `Background task ${taskType} completed`,
        processedAt: new Date(),
        data: { jobId: job.id, taskType },
    };
}, {
    connection: config_1.redisConnection,
    concurrency: config_1.workerConfig.concurrency.background,
    stalledInterval: config_1.workerConfig.stalledInterval,
    maxStalledCount: config_1.workerConfig.maxStalledCount,
});
/**
 * Order Processing Worker
 *
 * Processes order-related operations with moderate concurrency
 */
exports.orderProcessingWorker = new bullmq_1.Worker(types_1.QUEUE_NAMES.ORDER_PROCESSING, async (job) => {
    console.log(`[Order Processing Worker] Processing job ${job.id}: ${job.name}`);
    // Placeholder processor - implement based on your needs
    const { orderId, action, orderData } = job.data;
    console.log(`[Order Processing Worker] Processing ${action} for order ${orderId}`);
    return {
        success: true,
        message: `Order ${action} processed successfully`,
        processedAt: new Date(),
        data: { jobId: job.id, orderId, action },
    };
}, {
    connection: config_1.redisConnection,
    concurrency: config_1.workerConfig.concurrency.webhook, // Same as webhook for high priority
    stalledInterval: config_1.workerConfig.stalledInterval,
    maxStalledCount: config_1.workerConfig.maxStalledCount,
});
/**
 * Notifications Worker
 *
 * Processes notification jobs with moderate concurrency
 */
exports.notificationWorker = new bullmq_1.Worker(types_1.QUEUE_NAMES.NOTIFICATIONS, async (job) => {
    console.log(`[Notification Worker] Processing job ${job.id}: ${job.name}`);
    // Placeholder processor - implement based on your needs
    const { type, message, recipient, urgency } = job.data;
    console.log(`[Notification Worker] Sending ${type} notification with urgency ${urgency}`);
    return {
        success: true,
        message: `${type} notification sent successfully`,
        processedAt: new Date(),
        data: { jobId: job.id, type, urgency },
    };
}, {
    connection: config_1.redisConnection,
    concurrency: config_1.workerConfig.concurrency.email, // Same as email for similar workload
    stalledInterval: config_1.workerConfig.stalledInterval,
    maxStalledCount: config_1.workerConfig.maxStalledCount,
});
// ===========================================
// WORKER EVENT HANDLERS
// ===========================================
/**
 * Setup Event Handlers for All Workers
 *
 * These handlers provide comprehensive logging and monitoring for job processing
 */
function setupWorkerEventHandlers() {
    const workers = [
        { worker: exports.emailWorker, name: 'Email' },
        { worker: exports.webhookWorker, name: 'Webhook' },
        { worker: exports.productSyncWorker, name: 'ProductSync' },
        { worker: exports.backgroundWorker, name: 'Background' },
        { worker: exports.orderProcessingWorker, name: 'OrderProcessing' },
        { worker: exports.notificationWorker, name: 'Notification' },
    ];
    workers.forEach(({ worker, name }) => {
        // Job completion events
        worker.on('completed', (job, result) => {
            console.log(`[${name} Worker] ✅ Job ${job.id} completed successfully:`, {
                jobId: job.id,
                jobName: job.name,
                duration: Date.now() - job.processedOn,
                result: result?.success ? 'Success' : 'Failed',
                message: result?.message,
            });
        });
        // Job failure events
        worker.on('failed', (job, err) => {
            console.error(`[${name} Worker] ❌ Job ${job?.id} failed:`, {
                jobId: job?.id,
                jobName: job?.name,
                error: err.message,
                attemptsMade: job?.attemptsMade,
                stackTrace: err.stack,
            });
        });
        // Job active events
        worker.on('active', (job) => {
            console.log(`[${name} Worker] 🔄 Job ${job.id} started processing:`, {
                jobId: job.id,
                jobName: job.name,
                data: job.data,
            });
        });
        // Job progress events
        worker.on('progress', (job, progress) => {
            console.log(`[${name} Worker] 📊 Job ${job.id} progress: ${progress}%`);
        });
        // Worker error events
        worker.on('error', (err) => {
            console.error(`[${name} Worker] 💥 Worker error:`, {
                error: err.message,
                stack: err.stack,
            });
        });
        // Worker stalled events
        worker.on('stalled', (jobId) => {
            console.warn(`[${name} Worker] ⚠️ Job ${jobId} stalled and will be retried`);
        });
        // Worker closing events
        worker.on('closing', () => {
            console.log(`[${name} Worker] 🔽 Worker is closing`);
        });
        // Worker closed events
        worker.on('closed', () => {
            console.log(`[${name} Worker] 🔒 Worker closed`);
        });
    });
}
// Setup event handlers for all workers
setupWorkerEventHandlers();
// ===========================================
// BACKGROUND TASK PROCESSORS
// ===========================================
/**
 * Process Cleanup Task
 *
 * Handles data cleanup background tasks
 */
async function processCleanupTask(job, parameters) {
    const { olderThan = 30, tables = ['orders'] } = parameters;
    console.log(`[Background Worker] Starting cleanup task:`, {
        olderThan: `${olderThan} days`,
        tables,
    });
    await job.updateProgress(25);
    // Simulate cleanup work
    await new Promise(resolve => setTimeout(resolve, 2000));
    await job.updateProgress(75);
    console.log(`[Background Worker] Cleanup task completed`);
    await job.updateProgress(100);
}
/**
 * Process Report Generation
 *
 * Handles report generation background tasks
 */
async function processReportGeneration(job, parameters) {
    const { reportType = 'sales', dateRange } = parameters;
    console.log(`[Background Worker] Starting report generation:`, {
        reportType,
        dateRange,
    });
    await job.updateProgress(20);
    // Simulate report generation work
    await new Promise(resolve => setTimeout(resolve, 5000));
    await job.updateProgress(80);
    console.log(`[Background Worker] Report generation completed`);
    await job.updateProgress(100);
}
// ===========================================
// WORKER MANAGEMENT
// ===========================================
/**
 * All Workers Array
 *
 * For easy management and shutdown procedures
 */
exports.allWorkers = [
    exports.emailWorker,
    exports.webhookWorker,
    exports.productSyncWorker,
    exports.backgroundWorker,
    exports.orderProcessingWorker,
    exports.notificationWorker,
];
/**
 * Graceful Shutdown
 *
 * Properly closes all workers during application shutdown
 */
async function shutdownWorkers() {
    console.log('🔽 Shutting down all workers...');
    const shutdownPromises = exports.allWorkers.map(async (worker, index) => {
        try {
            console.log(`🔽 Closing worker ${index + 1}/${exports.allWorkers.length}...`);
            await worker.close();
            console.log(`✅ Worker ${index + 1} closed successfully`);
        }
        catch (error) {
            console.error(`❌ Error closing worker ${index + 1}:`, error);
        }
    });
    await Promise.all(shutdownPromises);
    console.log('🔒 All workers shut down');
}
/**
 * Worker Health Check
 *
 * Checks if all workers are running properly
 */
function getWorkerStatus() {
    return exports.allWorkers.map((worker, index) => ({
        index: index + 1,
        name: worker.name,
        isRunning: worker.isRunning(),
        isPaused: worker.isPaused(),
    }));
}
/**
 * Pause All Workers
 *
 * Pauses job processing on all workers
 */
async function pauseAllWorkers() {
    console.log('⏸️ Pausing all workers...');
    const pausePromises = exports.allWorkers.map(worker => worker.pause());
    await Promise.all(pausePromises);
    console.log('⏸️ All workers paused');
}
/**
 * Resume All Workers
 *
 * Resumes job processing on all workers
 */
async function resumeAllWorkers() {
    console.log('▶️ Resuming all workers...');
    const resumePromises = exports.allWorkers.map(worker => worker.resume());
    await Promise.all(resumePromises);
    console.log('▶️ All workers resumed');
}
// ===========================================
// GRACEFUL SHUTDOWN SETUP
// ===========================================
// Handle graceful shutdown on process termination
process.on('SIGTERM', async () => {
    console.log('📨 Received SIGTERM, shutting down gracefully...');
    await shutdownWorkers();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('📨 Received SIGINT, shutting down gracefully...');
    await shutdownWorkers();
    process.exit(0);
});
// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught Exception:', error);
    await shutdownWorkers();
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    await shutdownWorkers();
    process.exit(1);
});
console.log('🚀 All BullMQ workers started successfully!');
console.log('📊 Worker status:', getWorkerStatus());
