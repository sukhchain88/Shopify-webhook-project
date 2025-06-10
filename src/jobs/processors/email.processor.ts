import { Job } from 'bullmq';
import { EmailJobData, JobResult, JobError } from '../../queues/types.js';

/**
 * Email Job Processor
 * 
 * This processor handles all email-related jobs including:
 * - Simple text emails
 * - HTML template emails
 * - Bulk email operations
 * - Email with attachments
 * 
 * The processor integrates with your email service provider
 * (e.g., SendGrid, AWS SES, Nodemailer) to send emails.
 */

/**
 * Main Email Job Processor Function
 * 
 * This function is called by the BullMQ worker for each email job.
 * It processes the job data and sends the email using the appropriate method.
 */
export async function processEmailJob(job: Job<EmailJobData>): Promise<JobResult> {
  const startTime = Date.now();
  const { to, subject, template, body, htmlBody, templateData, attachments, cc, bcc } = job.data;
  
  // Log job start
  console.log(`[Email Processor] Starting email job ${job.id}:`, {
    to,
    subject,
    template,
    hasAttachments: !!attachments?.length,
    jobId: job.id,
  });

  try {
    // Validate email data
    await validateEmailData(job.data);
    
    // Update job progress
    await job.updateProgress(25);
    
    // Prepare email content
    const emailContent = await prepareEmailContent(job.data);
    await job.updateProgress(50);
    
    // Send email
    const emailResult = await sendEmail(emailContent);
    await job.updateProgress(75);
    
    // Log success
    console.log(`[Email Processor] Email sent successfully:`, {
      to,
      subject,
      messageId: emailResult.messageId,
      jobId: job.id,
    });
    
    await job.updateProgress(100);
    
    // Return success result
    return {
      success: true,
      message: `Email sent successfully to ${to}`,
      processedAt: new Date(),
      duration: Date.now() - startTime,
      data: {
        messageId: emailResult.messageId,
        recipient: to,
        subject,
        sentAt: new Date(),
      },
    };
    
  } catch (error) {
    // Log error details
    console.error(`[Email Processor] Failed to send email to ${to}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      jobId: job.id,
      subject,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Create structured error for retry logic
    const jobError: JobError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: getErrorCode(error),
      retryable: isRetryableError(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        to,
        subject,
        jobId: job.id,
        attemptNumber: job.attemptsMade,
      },
    };
    
    // Re-throw with structured error for BullMQ retry logic
    throw jobError;
  }
}

/**
 * Validate Email Data
 * 
 * Ensures the email job data is valid before processing
 */
async function validateEmailData(data: EmailJobData): Promise<void> {
  // Check required fields
  if (!data.to) {
    throw new Error('Recipient email address is required');
  }
  
  if (!data.subject) {
    throw new Error('Email subject is required');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.to)) {
    throw new Error(`Invalid email address format: ${data.to}`);
  }
  
  // Validate CC and BCC emails if provided
  if (data.cc) {
    for (const email of data.cc) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid CC email address format: ${email}`);
      }
    }
  }
  
  if (data.bcc) {
    for (const email of data.bcc) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid BCC email address format: ${email}`);
      }
    }
  }
  
  // Check that we have some content
  if (!data.body && !data.htmlBody && !data.template) {
    throw new Error('Email must have body, htmlBody, or template');
  }
  
  // Validate template data if using template
  if (data.template && !data.templateData) {
    console.warn(`Template ${data.template} specified but no templateData provided`);
  }
}

/**
 * Prepare Email Content
 * 
 * Processes the email data to create the final email content
 */
async function prepareEmailContent(data: EmailJobData) {
  let finalBody = data.body;
  let finalHtmlBody = data.htmlBody;
  
  // If using a template, render it with data
  if (data.template) {
    const templateResult = await renderEmailTemplate(data.template, data.templateData || {});
    finalBody = templateResult.text;
    finalHtmlBody = templateResult.html;
  }
  
  // Prepare email object
  const emailContent = {
    from: process.env.FROM_EMAIL || 'noreply@yourstore.com',
    to: data.to,
    cc: data.cc,
    bcc: data.bcc,
    subject: data.subject,
    text: finalBody,
    html: finalHtmlBody,
    attachments: data.attachments?.map(attachment => ({
      filename: attachment.filename,
      path: attachment.path,
      content: attachment.content,
      contentType: attachment.contentType,
    })),
  };
  
  return emailContent;
}

/**
 * Render Email Template
 * 
 * This function handles template rendering. You can integrate with
 * your preferred template engine (Handlebars, Mustache, etc.)
 */
async function renderEmailTemplate(templateName: string, data: Record<string, any>) {
  // This is a placeholder implementation. Replace with your actual template engine.
  // Example integrations:
  // - Handlebars: const template = Handlebars.compile(templateSource);
  // - Mustache: const rendered = Mustache.render(templateSource, data);
  // - React Email: const html = render(EmailTemplate(data));
  
  console.log(`[Email Processor] Rendering template: ${templateName}`, { data });
  
  // Mock template rendering - replace with actual implementation
  const templates: Record<string, { text: string; html: string }> = {
    'order-confirmation': {
      text: `Thank you for your order! Order #${data.orderNumber} has been confirmed.`,
      html: `<h1>Thank you for your order!</h1><p>Order #${data.orderNumber} has been confirmed.</p>`,
    },
    'welcome': {
      text: `Welcome ${data.name}! Thank you for joining us.`,
      html: `<h1>Welcome ${data.name}!</h1><p>Thank you for joining us.</p>`,
    },
    'password-reset': {
      text: `Click this link to reset your password: ${data.resetLink}`,
      html: `<h1>Password Reset</h1><p><a href="${data.resetLink}">Click here to reset your password</a></p>`,
    },
  };
  
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  // Simple variable replacement (replace with proper template engine)
  let text = template.text;
  let html = template.html;
  
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `\${${key}}`;
    text = text.replace(new RegExp(placeholder, 'g'), String(value));
    html = html.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  return { text, html };
}

/**
 * Send Email Function
 * 
 * This function integrates with your email service provider.
 * Replace this implementation with your actual email service.
 */
async function sendEmail(emailContent: any): Promise<{ messageId: string }> {
  // This is a placeholder implementation. Replace with your actual email service:
  // 
  // Example with Nodemailer:
  // const transporter = nodemailer.createTransporter({ ... });
  // const result = await transporter.sendMail(emailContent);
  // return { messageId: result.messageId };
  //
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // const result = await sgMail.send(emailContent);
  // return { messageId: result[0].headers['x-message-id'] };
  //
  // Example with AWS SES:
  // const ses = new AWS.SES();
  // const result = await ses.sendEmail({ ... }).promise();
  // return { messageId: result.MessageId };
  
  console.log(`[Email Processor] Sending email:`, {
    to: emailContent.to,
    subject: emailContent.subject,
    hasHtml: !!emailContent.html,
    hasText: !!emailContent.text,
    hasAttachments: !!emailContent.attachments?.length,
  });
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate occasional failures for testing retry logic
  if (Math.random() < 0.05) { // 5% failure rate
    throw new Error('Simulated email service failure');
  }
  
  // Return mock success result
  return {
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Get Error Code
 * 
 * Categorizes errors for better handling and monitoring
 */
function getErrorCode(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid email') || message.includes('email format')) {
      return 'INVALID_EMAIL';
    }
    if (message.includes('template not found')) {
      return 'TEMPLATE_ERROR';
    }
    if (message.includes('rate limit')) {
      return 'RATE_LIMITED';
    }
    if (message.includes('authentication') || message.includes('unauthorized')) {
      return 'AUTH_ERROR';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'NETWORK_ERROR';
    }
  }
  
  return 'UNKNOWN_ERROR';
}

/**
 * Check if Error is Retryable
 * 
 * Determines whether a failed job should be retried based on the error type
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Don't retry validation errors
    if (message.includes('invalid email') || 
        message.includes('required') ||
        message.includes('template not found')) {
      return false;
    }
    
    // Don't retry authentication errors
    if (message.includes('authentication') || message.includes('unauthorized')) {
      return false;
    }
    
    // Retry network errors and rate limits
    if (message.includes('network') || 
        message.includes('connection') ||
        message.includes('rate limit') ||
        message.includes('timeout')) {
      return true;
    }
  }
  
  // By default, retry unknown errors
  return true;
} 