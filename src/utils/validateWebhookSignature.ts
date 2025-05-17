// src\utils\validateWebhookSignature.ts
import crypto from "crypto";
import { Request } from "express";

export const validateWebhookSignature = (
  req: Request,
  webhookSecret: string
): boolean => {
  try {
    const hmacHeader = req.headers["x-shopify-hmac-sha256"] as string;
    if (!hmacHeader || !req.body) return false;

    const calculatedHmac = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("base64");

    return calculatedHmac === hmacHeader;
  } catch (error) {
    console.error("Error validating webhook signature:", error);
    return false;
  }
};
 