import crypto from "crypto";
import { SHOPIFY_WEBHOOK_SECRET, NODE_ENV } from "../config/config.js";
export const validateWebhookSignature = (req) => {
    try {
        if (NODE_ENV === "development") {
            if (!SHOPIFY_WEBHOOK_SECRET) {
                console.log("⚠️ Skipping webhook signature validation in development mode (no secret configured)");
                return true;
            }
            const hmacHeader = req.headers["x-shopify-hmac-sha256"];
            if (hmacHeader && hmacHeader.includes("test-hmac")) {
                console.log("⚠️ Accepting test webhook in development mode");
                return true;
            }
        }
        const hmacHeader = req.headers["x-shopify-hmac-sha256"];
        console.log("Received HMAC:", hmacHeader);
        if (!hmacHeader || !req.body) {
            console.log("Missing hmac header or body");
            return false;
        }
        const webhookSecret = SHOPIFY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.log("Missing webhook secret");
            return false;
        }
        const rawBody = req.body;
        const calculatedHmac = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("base64");
        console.log("Calculated HMAC:", calculatedHmac);
        const isValid = crypto.timingSafeEqual(Buffer.from(hmacHeader, "utf8"), Buffer.from(calculatedHmac, "utf8"));
        console.log("Signature validation result:", isValid);
        return isValid;
    }
    catch (error) {
        console.error("Error validating webhook signature:", error);
        return false;
    }
};
