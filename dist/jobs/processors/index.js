"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processors = exports.processWebhookJob = exports.processEmailJob = void 0;
exports.getProcessor = getProcessor;
var email_processor_js_1 = require("./email.processor.js");
Object.defineProperty(exports, "processEmailJob", { enumerable: true, get: function () { return email_processor_js_1.processEmailJob; } });
var webhook_processor_js_1 = require("./webhook.processor.js");
Object.defineProperty(exports, "processWebhookJob", { enumerable: true, get: function () { return webhook_processor_js_1.processWebhookJob; } });
exports.processors = {
    email: {
        'send-email': 'processEmailJob',
    },
    webhook: {
        'process-webhook': 'processWebhookJob',
    },
};
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
