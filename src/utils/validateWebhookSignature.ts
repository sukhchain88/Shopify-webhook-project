import crypto from "crypto";
import { Request } from "express";
import { SHOPIFY_WEBHOOK_SECRET } from "../config/config.js";

export const validateWebhookSignature = (req: Request): boolean => {
  try {
    const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;
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

    // req.body is already a Buffer here because of express.raw()
    const rawBody = req.body as Buffer;

    const calculatedHmac = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody) // Ensure we're using a Buffer
      .digest("base64");

    console.log("Calculated HMAC:", calculatedHmac);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(hmacHeader, "utf8"),
      Buffer.from(calculatedHmac, "utf8")
    );

    console.log("Signature validation result:", isValid);
    return isValid;
  } catch (error) {
    console.error("Error validating webhook signature:", error);
    return false;
  }
};
