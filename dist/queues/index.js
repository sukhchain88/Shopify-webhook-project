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
const config_js_1 = require("./config.js");
const types_js_1 = require("./types.js");
exports.emailQueue = new bullmq_1.Queue(types_js_1.QUEUE_NAMES.EMAIL, {
    connection: config_js_1.redisConnection,
    defaultJobOptions: config_js_1.queueConfigs.email,
});
exports.webhookQueue = new bullmq_1.Queue(types_js_1.QUEUE_NAMES.WEBHOOK, {
    connection: config_js_1.redisConnection,
    defaultJobOptions: config_js_1.queueConfigs.webhook,
});
exports.productSyncQueue = new bullmq_1.Queue(types_js_1.QUEUE_NAMES.PRODUCT_SYNC, {
    connection: config_js_1.redisConnection,
    defaultJobOptions: config_js_1.queueConfigs.productSync,
});
exports.backgroundQueue = new bullmq_1.Queue(types_js_1.QUEUE_NAMES.BACKGROUND, {
    connection: config_js_1.redisConnection,
    defaultJobOptions: config_js_1.queueConfigs.background,
});
exports.orderProcessingQueue = new bullmq_1.Queue(types_js_1.QUEUE_NAMES.ORDER_PROCESSING, {
    connection: config_js_1.redisConnection,
    defaultJobOptions: config_js_1.queueConfigs.webhook,
});
exports.notificationQueue = new bullmq_1.Queue(types_js_1.QUEUE_NAMES.NOTIFICATIONS, {
    connection: config_js_1.redisConnection,
    defaultJobOptions: config_js_1.queueConfigs.email,
});
exports.queues = {
    email: exports.emailQueue,
    webhook: exports.webhookQueue,
    productSync: exports.productSyncQueue,
    background: exports.backgroundQueue,
    orderProcessing: exports.orderProcessingQueue,
    notifications: exports.notificationQueue,
};
exports.queueNames = Object.keys(exports.queues);
async function checkQueueHealth() {
    const results = {};
    let allHealthy = true;
    for (const [name, queue] of Object.entries(exports.queues)) {
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
async function pauseAllQueues() {
    const pausePromises = Object.values(exports.queues).map(queue => queue.pause());
    await Promise.all(pausePromises);
}
async function resumeAllQueues() {
    const resumePromises = Object.values(exports.queues).map(queue => queue.resume());
    await Promise.all(resumePromises);
}
async function cleanAllQueues(olderThan = 24 * 60 * 60 * 1000) {
    const cleanPromises = Object.values(exports.queues).map(queue => Promise.all([
        queue.clean(olderThan, 10, 'completed'),
        queue.clean(olderThan, 50, 'failed'),
    ]));
    await Promise.all(cleanPromises);
}
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
process.on('SIGTERM', shutdownQueues);
process.on('SIGINT', shutdownQueues);
