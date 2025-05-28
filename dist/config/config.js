// src\config\config.ts
import * as dotenv from "dotenv";
// Load environment variables
dotenv.config();
// Environment variables
export const { PORT = "3000", NODE_ENV = "development", SHOPIFY_STORE_URL, SHOPIFY_ACCESS_TOKEN, SHOPIFY_WEBHOOK_SECRET, NGROK_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, } = process.env;
// Validate required environment variables
if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
    console.warn("⚠️ Warning: Shopify API credentials are not properly configured.");
}
if (!SHOPIFY_WEBHOOK_SECRET) {
    console.error("🚨 ERROR: SHOPIFY_WEBHOOK_SECRET is not set in .env file!");
    console.error("Please set SHOPIFY_WEBHOOK_SECRET to the value from your Shopify admin panel:");
    console.error("1. Go to Shopify admin > Settings > Notifications > Webhooks");
    console.error("2. Copy the webhook signing secret");
    console.error("3. Add it to your .env file as SHOPIFY_WEBHOOK_SECRET=your_secret");
    process.exit(1); // Exit if webhook secret is not set
}
// Export derived configuration
export const DB_CONFIG = {
    host: DB_HOST || "localhost",
    port: parseInt(DB_PORT || "5432", 10),
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
};
