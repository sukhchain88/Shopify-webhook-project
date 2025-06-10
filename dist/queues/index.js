import { Queue } from 'bullmq';
import { redisConnection, queueConfigs } from './config.js';
import { QUEUE_NAMES } from './types.js';
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
    connection: redisConnection,
    defaultJobOptions: queueConfigs.email,
});
export const webhookQueue = new Queue(QUEUE_NAMES.WEBHOOK, {
    connection: redisConnection,
    defaultJobOptions: queueConfigs.webhook,
});
export const productSyncQueue = new Queue(QUEUE_NAMES.PRODUCT_SYNC, {
    connection: redisConnection,
    defaultJobOptions: queueConfigs.productSync,
});
export const backgroundQueue = new Queue(QUEUE_NAMES.BACKGROUND, {
    connection: redisConnection,
    defaultJobOptions: queueConfigs.background,
});
export const orderProcessingQueue = new Queue(QUEUE_NAMES.ORDER_PROCESSING, {
    connection: redisConnection,
    defaultJobOptions: queueConfigs.webhook,
});
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
    connection: redisConnection,
    defaultJobOptions: queueConfigs.email,
});
export const queues = {
    email: emailQueue,
    webhook: webhookQueue,
    productSync: productSyncQueue,
    background: backgroundQueue,
    orderProcessing: orderProcessingQueue,
    notifications: notificationQueue,
};
export const queueNames = Object.keys(queues);
export async function checkQueueHealth() {
    const results = {};
    let allHealthy = true;
    for (const [name, queue] of Object.entries(queues)) {
        try {
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
export async function getQueueStatistics() {
    const statistics = {};
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
        }
        catch (error) {
            statistics[name] = {
                error: error instanceof Error ? error.message : 'Failed to get statistics',
            };
        }
    }
    return statistics;
}
export async function pauseAllQueues() {
    const pausePromises = Object.values(queues).map(queue => queue.pause());
    await Promise.all(pausePromises);
}
export async function resumeAllQueues() {
    const resumePromises = Object.values(queues).map(queue => queue.resume());
    await Promise.all(resumePromises);
}
export async function cleanAllQueues(olderThan = 24 * 60 * 60 * 1000) {
    const cleanPromises = Object.values(queues).map(queue => Promise.all([
        queue.clean(olderThan, 10, 'completed'),
        queue.clean(olderThan, 50, 'failed'),
    ]));
    await Promise.all(cleanPromises);
}
export async function shutdownQueues() {
    console.log('Shutting down queues...');
    const closePromises = Object.entries(queues).map(async ([name, queue]) => {
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
process.on('SIGTERM', shutdownQueues);
process.on('SIGINT', shutdownQueues);
