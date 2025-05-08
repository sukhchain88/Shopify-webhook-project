// src\config\config.ts
import dotenv from 'dotenv';
dotenv.config();
export const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || '';
export const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';
// Validate required environment variables
if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
    console.warn('Warning: Shopify API credentials are not properly configured.');
}
export const DB_HOST = process.env.DB_HOST || '';
export const DB_PORT = process.env.DB_PORT || '';
export const DB_USER = process.env.DB_USER || '';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_NAME = process.env.DB_NAME || '';
export const NGROK_URL = process.env.NGROK_URL || '';
export const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
