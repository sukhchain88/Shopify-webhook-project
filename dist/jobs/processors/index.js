export { processEmailJob } from './email.processor.js';
export { processWebhookJob } from './webhook.processor.js';
export const processors = {
    email: {
        'send-email': 'processEmailJob',
    },
    webhook: {
        'process-webhook': 'processWebhookJob',
    },
};
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
