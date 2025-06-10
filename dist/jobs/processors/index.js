"use strict";
/**
 * Job Processors Index
 *
 * This file exports all job processors for easy importing and management.
 * It provides a centralized access point to all processor functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processors = exports.processWebhookJob = exports.processEmailJob = void 0;
exports.getProcessor = getProcessor;
// Email processors
var email_processor_js_1 = require("./email.processor.js");
Object.defineProperty(exports, "processEmailJob", { enumerable: true, get: function () { return email_processor_js_1.processEmailJob; } });
// Webhook processors
var webhook_processor_js_1 = require("./webhook.processor.js");
Object.defineProperty(exports, "processWebhookJob", { enumerable: true, get: function () { return webhook_processor_js_1.processWebhookJob; } });
// Export processor registry for dynamic access
exports.processors = {
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
function getProcessor(queueName, jobName) {
    const queueProcessors = exports.processors[queueName];
    if (!queueProcessors) {
        throw new Error(`No processors found for queue: ${queueName}`);
    }
    const processorName = queueProcessors[jobName];
    if (!processorName) {
        throw new Error(`No processor found for job ${jobName} in queue ${queueName}`);
    }
    return processorName;
}
