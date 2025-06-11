import { Job } from '../models/Job';
import { Op } from 'sequelize';

/**
 * Simple Database Queue Service
 * 
 * A lightweight queue system that uses your database instead of Redis.
 * Perfect for Render free tier as it doesn't require external dependencies.
 * 
 * Features:
 * - No Redis dependency
 * - Survives app restarts
 * - Works with free tier spinning
 * - Built-in retry mechanism
 * - Scheduled jobs support
 */

export class SimpleQueueService {
  private static processingInterval: NodeJS.Timeout | null = null;
  private static isProcessing = false;

  /**
   * Add a job to the queue
   */
  static async addJob(
    type: string,
    payload: object,
    options: {
      maxAttempts?: number;
      delayMs?: number;
    } = {}
  ) {
    const { maxAttempts = 3, delayMs = 0 } = options;
    
    const scheduledAt = new Date();
    if (delayMs > 0) {
      scheduledAt.setTime(scheduledAt.getTime() + delayMs);
    }

    const job = await Job.create({
      type,
      payload,
      maxAttempts,
      scheduledAt,
      status: 'pending',
      attempts: 0,
    });

    console.log(`[Simple Queue] Job ${job.id} added: ${type}`);
    return job;
  }

  /**
   * Add multiple jobs at once
   */
  static async addBulkJobs(
    jobs: Array<{
      type: string;
      payload: object;
      maxAttempts?: number;
      delayMs?: number;
    }>
  ) {
    const jobData = jobs.map((job, index) => {
      const scheduledAt = new Date();
      if (job.delayMs) {
        scheduledAt.setTime(scheduledAt.getTime() + (job.delayMs * (index + 1)));
      }

      return {
        type: job.type,
        payload: job.payload,
        maxAttempts: job.maxAttempts || 3,
        scheduledAt,
        status: 'pending' as const,
        attempts: 0,
      };
    });

    const createdJobs = await Job.bulkCreate(jobData);
    console.log(`[Simple Queue] ${createdJobs.length} bulk jobs added`);
    return createdJobs;
  }

  /**
   * Process pending jobs
   */
  static async processJobs() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Get pending jobs that are ready to process
      const pendingJobs = await Job.findAll({
        where: {
          status: 'pending',
          scheduledAt: {
            [Op.lte]: new Date(),
          },
        },
        order: [['scheduledAt', 'ASC']],
        limit: 10, // Process in batches
      });

      for (const job of pendingJobs) {
        await this.processJob(job);
      }
    } catch (error) {
      console.error('[Simple Queue] Error processing jobs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single job
   */
  private static async processJob(job: Job) {
    try {
      // Mark as processing
      await job.update({
        status: 'processing',
        attempts: job.attempts + 1,
      });

      console.log(`[Simple Queue] Processing job ${job.id}: ${job.type}`);

      // Process based on job type
      const result = await this.executeJob(job.type, job.payload);

      // Mark as completed
      await job.update({
        status: 'completed',
        processedAt: new Date(),
      });

      console.log(`[Simple Queue] ✅ Job ${job.id} completed successfully`);
      return result;

    } catch (error) {
      console.error(`[Simple Queue] ❌ Job ${job.id} failed:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if we should retry
      if (job.attempts < job.maxAttempts) {
        // Reset to pending for retry with exponential backoff
        const delayMs = Math.pow(2, job.attempts) * 1000; // 2s, 4s, 8s...
        const nextAttempt = new Date();
        nextAttempt.setTime(nextAttempt.getTime() + delayMs);

        await job.update({
          status: 'pending',
          scheduledAt: nextAttempt,
          errorMessage,
        });

        console.log(`[Simple Queue] Job ${job.id} scheduled for retry in ${delayMs}ms`);
      } else {
        // Max attempts reached, mark as failed
        await job.update({
          status: 'failed',
          errorMessage,
          processedAt: new Date(),
        });

        console.log(`[Simple Queue] Job ${job.id} failed permanently after ${job.attempts} attempts`);
      }
    }
  }

  /**
   * Execute job based on type
   */
  private static async executeJob(type: string, payload: any): Promise<any> {
    switch (type) {
      case 'send_email':
        return await this.processSendEmail(payload);
      
      case 'process_webhook':
        return await this.processWebhook(payload);
      
      case 'sync_product':
        return await this.processSyncProduct(payload);
      
      case 'send_notification':
        return await this.processSendNotification(payload);
      
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }

  /**
   * Job processors - implement your logic here
   */
  private static async processSendEmail(payload: any) {
    // Implement email sending logic
    console.log(`[Simple Queue] Sending email to ${payload.to}`);
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  private static async processWebhook(payload: any) {
    // Implement webhook processing logic
    console.log(`[Simple Queue] Processing webhook: ${payload.topic}`);
    // Simulate webhook processing
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, processed: true };
  }

  private static async processSyncProduct(payload: any) {
    // Implement product sync logic
    console.log(`[Simple Queue] Syncing product: ${payload.productId}`);
    // Simulate product sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, synced: true };
  }

  private static async processSendNotification(payload: any) {
    // Implement notification sending logic
    console.log(`[Simple Queue] Sending notification: ${payload.type}`);
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, sent: true };
  }

  /**
   * Start background job processing
   */
  static startProcessor(intervalMs = 5000) {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(async () => {
      await this.processJobs();
    }, intervalMs);

    console.log(`[Simple Queue] Job processor started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop background job processing
   */
  static stopProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('[Simple Queue] Job processor stopped');
    }
  }

  /**
   * Get queue statistics
   */
  static async getStats() {
    const [pending, processing, completed, failed] = await Promise.all([
      Job.count({ where: { status: 'pending' } }),
      Job.count({ where: { status: 'processing' } }),
      Job.count({ where: { status: 'completed' } }),
      Job.count({ where: { status: 'failed' } }),
    ]);

    return {
      pending,
      processing,
      completed,
      failed,
      total: pending + processing + completed + failed,
    };
  }

  /**
   * Clean up old completed/failed jobs
   */
  static async cleanup(olderThanHours = 24) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

    const deleted = await Job.destroy({
      where: {
        status: ['completed', 'failed'],
        processedAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    console.log(`[Simple Queue] Cleaned up ${deleted} old jobs`);
    return deleted;
  }
} 