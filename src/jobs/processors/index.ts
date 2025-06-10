/**
 * Job Processors Index
 * 
 * This file exports all job processors for easy importing and management.
 * It provides a centralized access point to all processor functions.
 */

// Email processors
export { processEmailJob } from './email.processor';

// Webhook processors
export { processWebhookJob } from './webhook.processor';

// Export processor registry for dynamic access
export const processors = {
  email: {
    'send-email': 'processEmailJob',
  },
  webhook: {
    'process-webhook': 'processWebhookJob',
  },
} as const;

/**
 * Get Processor Function
 * 
 * Utility function to get the correct processor function based on queue and job name
 */
export function getProcessor(queueName: string, jobName: string) {
  const queueProcessors = processors[queueName as keyof typeof processors];
  if (!queueProcessors) {
    throw new Error(`No processors found for queue: ${queueName}`);
  }
  
  const processorName = queueProcessors[jobName as keyof typeof queueProcessors];
  if (!processorName) {
    throw new Error(`No processor found for job ${jobName} in queue ${queueName}`);
  }
  
  return processorName;
} 