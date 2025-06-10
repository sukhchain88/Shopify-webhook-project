/**
 * Job Processors Index
 *
 * This file exports all job processors for easy importing and management.
 * It provides a centralized access point to all processor functions.
 */
// Email processors
export { processEmailJob } from './email.processor.js';
// Webhook processors
export { processWebhookJob } from './webhook.processor.js';
// Export processor registry for dynamic access
export const processors = {
    email: {
        'send-email': 'processEmailJob',
    },
    webhook: {
        'process-webhook': 'processWebhookJob',
    },
};
/**
 * Get Processor Function
 *
 * Utility function to get the correct processor function based on queue and job name
 */
export function getProcessor(queueName, jobName) {
    const queueProcessors = processors[queueName];
    if (!queueProcessors) {
        throw new Error(`No processors found for queue: ${queueName}`);
    }
    const processorName = queueProcessors[jobName];
    if (!processorName) {
        throw new Error(`No processor found for job ${jobName} in queue ${queueName}`);
    }
    return processorName;
}
