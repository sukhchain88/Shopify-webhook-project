import { Worker } from 'bullmq';
import { redisConnection, workerConfig } from '../queues/config.js';
import { QUEUE_NAMES } from '../queues/types.js';
import { processEmailJob } from '../jobs/processors/email.processor.js';
import { processWebhookJob } from '../jobs/processors/webhook.processor.js';
export const emailWorker = new Worker(QUEUE_NAMES.EMAIL, async (job) => {
    console.log(`[Email Worker] Processing job ${job.id}: ${job.name}`);
    return await processEmailJob(job);
}, {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.email,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
});
export const webhookWorker = new Worker(QUEUE_NAMES.WEBHOOK, async (job) => {
    console.log(`[Webhook Worker] Processing job ${job.id}: ${job.name}`);
    return await processWebhookJob(job);
}, {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.webhook,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
});
export const productSyncWorker = new Worker(QUEUE_NAMES.PRODUCT_SYNC, async (job) => {
    console.log(`[Product Sync Worker] Processing job ${job.id}: ${job.name}`);
    console.log(`[Product Sync Worker] Product sync job completed: ${job.id}`);
    return {
        success: true,
        message: 'Product sync completed',
        processedAt: new Date(),
        data: { jobId: job.id },
    };
}, {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.productSync,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
});
export const backgroundWorker = new Worker(QUEUE_NAMES.BACKGROUND, async (job) => {
    console.log(`[Background Worker] Processing job ${job.id}: ${job.name}`);
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
    connection: redisConnection,
    concurrency: workerConfig.concurrency.background,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
});
export const orderProcessingWorker = new Worker(QUEUE_NAMES.ORDER_PROCESSING, async (job) => {
    console.log(`[Order Processing Worker] Processing job ${job.id}: ${job.name}`);
    const { orderId, action, orderData } = job.data;
    console.log(`[Order Processing Worker] Processing ${action} for order ${orderId}`);
    return {
        success: true,
        message: `Order ${action} processed successfully`,
        processedAt: new Date(),
        data: { jobId: job.id, orderId, action },
    };
}, {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.webhook,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
});
export const notificationWorker = new Worker(QUEUE_NAMES.NOTIFICATIONS, async (job) => {
    console.log(`[Notification Worker] Processing job ${job.id}: ${job.name}`);
    const { type, message, recipient, urgency } = job.data;
    console.log(`[Notification Worker] Sending ${type} notification with urgency ${urgency}`);
    return {
        success: true,
        message: `${type} notification sent successfully`,
        processedAt: new Date(),
        data: { jobId: job.id, type, urgency },
    };
}, {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.email,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
});
function setupWorkerEventHandlers() {
    const workers = [
        { worker: emailWorker, name: 'Email' },
        { worker: webhookWorker, name: 'Webhook' },
        { worker: productSyncWorker, name: 'ProductSync' },
        { worker: backgroundWorker, name: 'Background' },
        { worker: orderProcessingWorker, name: 'OrderProcessing' },
        { worker: notificationWorker, name: 'Notification' },
    ];
    workers.forEach(({ worker, name }) => {
        worker.on('completed', (job, result) => {
            console.log(`[${name} Worker] ✅ Job ${job.id} completed successfully:`, {
                jobId: job.id,
                jobName: job.name,
                duration: Date.now() - job.processedOn,
                result: result?.success ? 'Success' : 'Failed',
                message: result?.message,
            });
        });
        worker.on('failed', (job, err) => {
            console.error(`[${name} Worker] ❌ Job ${job?.id} failed:`, {
                jobId: job?.id,
                jobName: job?.name,
                error: err.message,
                attemptsMade: job?.attemptsMade,
                stackTrace: err.stack,
            });
        });
        worker.on('active', (job) => {
            console.log(`[${name} Worker] 🔄 Job ${job.id} started processing:`, {
                jobId: job.id,
                jobName: job.name,
                data: job.data,
            });
        });
        worker.on('progress', (job, progress) => {
            console.log(`[${name} Worker] 📊 Job ${job.id} progress: ${progress}%`);
        });
        worker.on('error', (err) => {
            console.error(`[${name} Worker] 💥 Worker error:`, {
                error: err.message,
                stack: err.stack,
            });
        });
        worker.on('stalled', (jobId) => {
            console.warn(`[${name} Worker] ⚠️ Job ${jobId} stalled and will be retried`);
        });
        worker.on('closing', () => {
            console.log(`[${name} Worker] 🔽 Worker is closing`);
        });
        worker.on('closed', () => {
            console.log(`[${name} Worker] 🔒 Worker closed`);
        });
    });
}
setupWorkerEventHandlers();
async function processCleanupTask(job, parameters) {
    const { olderThan = 30, tables = ['orders'] } = parameters;
    console.log(`[Background Worker] Starting cleanup task:`, {
        olderThan: `${olderThan} days`,
        tables,
    });
    await job.updateProgress(25);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await job.updateProgress(75);
    console.log(`[Background Worker] Cleanup task completed`);
    await job.updateProgress(100);
}
async function processReportGeneration(job, parameters) {
    const { reportType = 'sales', dateRange } = parameters;
    console.log(`[Background Worker] Starting report generation:`, {
        reportType,
        dateRange,
    });
    await job.updateProgress(20);
    await new Promise(resolve => setTimeout(resolve, 5000));
    await job.updateProgress(80);
    console.log(`[Background Worker] Report generation completed`);
    await job.updateProgress(100);
}
export const allWorkers = [
    emailWorker,
    webhookWorker,
    productSyncWorker,
    backgroundWorker,
    orderProcessingWorker,
    notificationWorker,
];
export async function shutdownWorkers() {
    console.log('🔽 Shutting down all workers...');
    const shutdownPromises = allWorkers.map(async (worker, index) => {
        try {
            console.log(`🔽 Closing worker ${index + 1}/${allWorkers.length}...`);
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
export function getWorkerStatus() {
    return allWorkers.map((worker, index) => ({
        index: index + 1,
        name: worker.name,
        isRunning: worker.isRunning(),
        isPaused: worker.isPaused(),
    }));
}
export async function pauseAllWorkers() {
    console.log('⏸️ Pausing all workers...');
    const pausePromises = allWorkers.map(worker => worker.pause());
    await Promise.all(pausePromises);
    console.log('⏸️ All workers paused');
}
export async function resumeAllWorkers() {
    console.log('▶️ Resuming all workers...');
    const resumePromises = allWorkers.map(worker => worker.resume());
    await Promise.all(resumePromises);
    console.log('▶️ All workers resumed');
}
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
process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught Exception:', error);
    await shutdownWorkers();
    process.exit(1);
});
process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    await shutdownWorkers();
    process.exit(1);
});
console.log('🚀 All BullMQ workers started successfully!');
console.log('📊 Worker status:', getWorkerStatus());
