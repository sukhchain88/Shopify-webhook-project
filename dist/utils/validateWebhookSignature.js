import crypto from "crypto";
export const validateWebhookSignature = (req, webhookSecret) => {
    try {
        const hmacHeader = req.headers["x-shopify-hmac-sha256"];
        if (!hmacHeader || !req.body)
            return false;
        const calculatedHmac = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body) // 👈 Must be Buffer, not string
            .digest("base64");
        return crypto.timingSafeEqual(Buffer.from(hmacHeader, "utf8"), Buffer.from(calculatedHmac, "utf8"));
    }
    catch (error) {
        console.error("Error validating webhook signature:", error);
        return false;
    }
};
