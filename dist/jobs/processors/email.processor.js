export async function processEmailJob(job) {
    const startTime = Date.now();
    const { to, subject, template, body, htmlBody, templateData, attachments, cc, bcc } = job.data;
    console.log(`[Email Processor] Starting email job ${job.id}:`, {
        to,
        subject,
        template,
        hasAttachments: !!attachments?.length,
        jobId: job.id,
    });
    try {
        await validateEmailData(job.data);
        await job.updateProgress(25);
        const emailContent = await prepareEmailContent(job.data);
        await job.updateProgress(50);
        const emailResult = await sendEmail(emailContent);
        await job.updateProgress(75);
        console.log(`[Email Processor] Email sent successfully:`, {
            to,
            subject,
            messageId: emailResult.messageId,
            jobId: job.id,
        });
        await job.updateProgress(100);
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
    }
    catch (error) {
        console.error(`[Email Processor] Failed to send email to ${to}:`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            jobId: job.id,
            subject,
            stack: error instanceof Error ? error.stack : undefined,
        });
        const jobError = {
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
        throw jobError;
    }
}
async function validateEmailData(data) {
    if (!data.to) {
        throw new Error('Recipient email address is required');
    }
    if (!data.subject) {
        throw new Error('Email subject is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.to)) {
        throw new Error(`Invalid email address format: ${data.to}`);
    }
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
    if (!data.body && !data.htmlBody && !data.template) {
        throw new Error('Email must have body, htmlBody, or template');
    }
    if (data.template && !data.templateData) {
        console.warn(`Template ${data.template} specified but no templateData provided`);
    }
}
async function prepareEmailContent(data) {
    let finalBody = data.body;
    let finalHtmlBody = data.htmlBody;
    if (data.template) {
        const templateResult = await renderEmailTemplate(data.template, data.templateData || {});
        finalBody = templateResult.text;
        finalHtmlBody = templateResult.html;
    }
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
async function renderEmailTemplate(templateName, data) {
    console.log(`[Email Processor] Rendering template: ${templateName}`, { data });
    const templates = {
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
    let text = template.text;
    let html = template.html;
    for (const [key, value] of Object.entries(data)) {
        const placeholder = `\${${key}}`;
        text = text.replace(new RegExp(placeholder, 'g'), String(value));
        html = html.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return { text, html };
}
async function sendEmail(emailContent) {
    console.log(`[Email Processor] Sending email:`, {
        to: emailContent.to,
        subject: emailContent.subject,
        hasHtml: !!emailContent.html,
        hasText: !!emailContent.text,
        hasAttachments: !!emailContent.attachments?.length,
    });
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    if (Math.random() < 0.05) {
        throw new Error('Simulated email service failure');
    }
    return {
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
}
function getErrorCode(error) {
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
function isRetryableError(error) {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('invalid email') ||
            message.includes('required') ||
            message.includes('template not found')) {
            return false;
        }
        if (message.includes('authentication') || message.includes('unauthorized')) {
            return false;
        }
        if (message.includes('network') ||
            message.includes('connection') ||
            message.includes('rate limit') ||
            message.includes('timeout')) {
            return true;
        }
    }
    return true;
}
