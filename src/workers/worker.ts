import { Worker, Job } from 'bullmq';
import { redisConnection, workerConfig } from '../queues/config.js';
import { QUEUE_NAMES } from '../queues/types.js';
import { processEmailJob } from '../jobs/processors/email.processor.js';
import { processWebhookJob } from '../jobs/processors/webhook.processor.js';

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
export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job: Job) => {
    console.log(`[Email Worker] Processing job ${job.id}: ${job.name}`);
    return await processEmailJob(job);
  },
  {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.email,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
  }
);

/**
 * Webhook Worker
 * 
 * Processes webhook events with moderate concurrency to handle database operations safely
 */
export const webhookWorker = new Worker(
  QUEUE_NAMES.WEBHOOK,
  async (job: Job) => {
    console.log(`[Webhook Worker] Processing job ${job.id}: ${job.name}`);
    return await processWebhookJob(job);
  },
  {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.webhook,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
  }
);

/**
 * Product Sync Worker
 * 
 * Processes product synchronization jobs with limited concurrency to avoid API rate limits
 */
export const productSyncWorker = new Worker(
  QUEUE_NAMES.PRODUCT_SYNC,
  async (job: Job) => {
    console.log(`[Product Sync Worker] Processing job ${job.id}: ${job.name}`);
    
    // Placeholder processor - implement based on your needs
    console.log(`[Product Sync Worker] Product sync job completed: ${job.id}`);
    return {
      success: true,
      message: 'Product sync completed',
      processedAt: new Date(),
      data: { jobId: job.id },
    };
  },
  {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.productSync,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
  }
);

/**
 * Background Tasks Worker
 * 
 * Processes background tasks with low concurrency to avoid impacting system performance
 */
export const backgroundWorker = new Worker(
  QUEUE_NAMES.BACKGROUND,
  async (job: Job) => {
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
  },
  {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.background,
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
  }
);

/**
 * Order Processing Worker
 * 
 * Processes order-related operations with moderate concurrency
 */
export const orderProcessingWorker = new Worker(
  QUEUE_NAMES.ORDER_PROCESSING,
  async (job: Job) => {
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
  },
  {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.webhook, // Same as webhook for high priority
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
  }
);

/**
 * Notifications Worker
 * 
 * Processes notification jobs with moderate concurrency
 */
export const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job) => {
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
  },
  {
    connection: redisConnection,
    concurrency: workerConfig.concurrency.email, // Same as email for similar workload
    stalledInterval: workerConfig.stalledInterval,
    maxStalledCount: workerConfig.maxStalledCount,
  }
);

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
    { worker: emailWorker, name: 'Email' },
    { worker: webhookWorker, name: 'Webhook' },
    { worker: productSyncWorker, name: 'ProductSync' },
    { worker: backgroundWorker, name: 'Background' },
    { worker: orderProcessingWorker, name: 'OrderProcessing' },
    { worker: notificationWorker, name: 'Notification' },
  ];

  workers.forEach(({ worker, name }) => {
    // Job completion events
    worker.on('completed', (job: Job, result: any) => {
      console.log(`[${name} Worker] ✅ Job ${job.id} completed successfully:`, {
        jobId: job.id,
        jobName: job.name,
        duration: Date.now() - job.processedOn!,
        result: result?.success ? 'Success' : 'Failed',
        message: result?.message,
      });
    });

    // Job failure events
    worker.on('failed', (job: Job | undefined, err: Error) => {
      console.error(`[${name} Worker] ❌ Job ${job?.id} failed:`, {
        jobId: job?.id,
        jobName: job?.name,
        error: err.message,
        attemptsMade: job?.attemptsMade,
        stackTrace: err.stack,
      });
    });

    // Job active events
    worker.on('active', (job: Job) => {
      console.log(`[${name} Worker] 🔄 Job ${job.id} started processing:`, {
        jobId: job.id,
        jobName: job.name,
        data: job.data,
      });
    });

    // Job progress events
    worker.on('progress', (job: Job, progress: any) => {
      console.log(`[${name} Worker] 📊 Job ${job.id} progress: ${progress}%`);
    });

    // Worker error events
    worker.on('error', (err: Error) => {
      console.error(`[${name} Worker] 💥 Worker error:`, {
        error: err.message,
        stack: err.stack,
      });
    });

    // Worker stalled events
    worker.on('stalled', (jobId: string) => {
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
async function processCleanupTask(job: Job, parameters: any) {
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
async function processReportGeneration(job: Job, parameters: any) {
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
export const allWorkers = [
  emailWorker,
  webhookWorker,
  productSyncWorker,
  backgroundWorker,
  orderProcessingWorker,
  notificationWorker,
];

/**
 * Graceful Shutdown
 * 
 * Properly closes all workers during application shutdown
 */
export async function shutdownWorkers(): Promise<void> {
  console.log('🔽 Shutting down all workers...');
  
  const shutdownPromises = allWorkers.map(async (worker, index) => {
    try {
      console.log(`🔽 Closing worker ${index + 1}/${allWorkers.length}...`);
      await worker.close();
      console.log(`✅ Worker ${index + 1} closed successfully`);
    } catch (error) {
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
export function getWorkerStatus() {
  return allWorkers.map((worker, index) => ({
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
export async function pauseAllWorkers(): Promise<void> {
  console.log('⏸️ Pausing all workers...');
  
  const pausePromises = allWorkers.map(worker => worker.pause());
  await Promise.all(pausePromises);
  
  console.log('⏸️ All workers paused');
}

/**
 * Resume All Workers
 * 
 * Resumes job processing on all workers
 */
export async function resumeAllWorkers(): Promise<void> {
  console.log('▶️ Resuming all workers...');
  
  const resumePromises = allWorkers.map(worker => worker.resume());
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