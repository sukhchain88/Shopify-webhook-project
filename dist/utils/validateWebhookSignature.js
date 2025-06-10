"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebhookSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
const config_js_1 = require("../config/config.js");
const validateWebhookSignature = (req) => {
    try {
        if (config_js_1.NODE_ENV === "development") {
            if (!config_js_1.SHOPIFY_WEBHOOK_SECRET) {
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
        const webhookSecret = config_js_1.SHOPIFY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.log("Missing webhook secret");
            return false;
        }
        const rawBody = req.body;
        const calculatedHmac = crypto_1.default
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("base64");
        console.log("Calculated HMAC:", calculatedHmac);
        const isValid = crypto_1.default.timingSafeEqual(Buffer.from(hmacHeader, "utf8"), Buffer.from(calculatedHmac, "utf8"));
        console.log("Signature validation result:", isValid);
        return isValid;
    }
    catch (error) {
        console.error("Error validating webhook signature:", error);
        return false;
    }
};
exports.validateWebhookSignature = validateWebhookSignature;
