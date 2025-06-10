import { validateWebhookSignature } from "../utils/validateWebhookSignature.js";
import { WebhookService } from "../services/WebhookService.js";
import { validateWebhookPayload } from "../validators/webhook.validator.js";
export const handleWebhook = async (req, res) => {
    try {
        const topic = req.headers["x-shopify-topic"];
        const shopDomain = req.headers["x-shopify-shop-domain"];
        if (!topic || !shopDomain) {
            console.log("Missing required headers", { topic, shopDomain });
            return res.status(400).json({
                success: false,
                error: "Missing required headers",
                message: "Both x-shopify-topic and x-shopify-shop-domain headers are required",
            });
        }
        if (!validateWebhookSignature(req)) {
            console.log("Webhook signature validation failed");
            return res.status(401).json({
                success: false,
                error: "Invalid signature",
                message: "Webhook signature mismatch",
            });
        }
        let payload;
        try {
            const rawBodyBuffer = req.body;
            const rawBodyString = rawBodyBuffer.toString('utf8');
            payload = JSON.parse(rawBodyString);
            if (!payload.shop_domain) {
                payload.shop_domain = shopDomain;
            }
        }
        catch (parseError) {
            console.log("Failed to parse webhook payload", parseError);
            return res.status(400).json({
                success: false,
                error: "Invalid JSON",
                message: "Failed to parse webhook payload",
            });
        }
        const validationResult = validateWebhookPayload(topic, payload);
        if (!validationResult.success) {
            console.log("Webhook payload validation failed:", validationResult.error);
            return res.status(400).json({
                success: false,
                error: "Invalid payload",
                message: "Webhook payload validation failed",
                details: validationResult.error.errors
            });
        }
        console.log(`📥 Processing webhook: ${topic}`);
        const webhook = await WebhookService.processWebhook(topic, payload, shopDomain);
        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully",
            topic,
            shopDomain,
            webhookId: webhook.id
        });
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
export const getWebhooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const webhooks = await WebhookService.getWebhooks(page, limit);
        return res.status(200).json({
            success: true,
            data: webhooks.rows,
            pagination: {
                total: webhooks.count,
                page,
                limit,
                pages: Math.ceil(webhooks.count / limit)
            }
        });
    }
    catch (err) {
        console.error("Error fetching webhooks:", err);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch webhooks",
            message: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
export const getWebhookById = async (req, res) => {
    try {
        const webhook = await WebhookService.getWebhookById(parseInt(req.params.id));
        if (!webhook) {
            return res.status(404).json({
                success: false,
                error: "Not found",
                message: "Webhook not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: webhook
        });
    }
    catch (err) {
        console.error("Error fetching webhook:", err);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch webhook",
            message: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
export const deleteWebhook = async (req, res) => {
    try {
        await WebhookService.deleteWebhook(parseInt(req.params.id));
        return res.status(200).json({
            success: true,
            message: "Webhook deleted successfully"
        });
    }
    catch (err) {
        console.error("Error deleting webhook:", err);
        return res.status(500).json({
            success: false,
            error: "Failed to delete webhook",
            message: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
