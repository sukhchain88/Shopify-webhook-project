import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
// Load environment variables from .env file
dotenvConfig();
// Environment variables validation schema
const envSchema = z.object({
    // Server
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Database
    DATABASE_URL: z.string(),
    // Shopify
    SHOPIFY_SHOP_NAME: z.string(),
    SHOPIFY_ACCESS_TOKEN: z.string(),
    SHOPIFY_API_VERSION: z.string(),
    SHOPIFY_WEBHOOK_SECRET: z.string(),
    // Security
    JWT_SECRET: z.string(),
    ENCRYPTION_KEY: z.string(),
    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
    // Cache
    REDIS_URL: z.string().optional(),
    // Monitoring
    ENABLE_METRICS: z.string().default('false'),
    METRICS_PORT: z.string().default('9090'),
});
// Parse and validate environment variables
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:', error.errors);
        }
        else {
            console.error('❌ Error parsing environment variables:', error);
        }
        process.exit(1);
    }
};
// Export validated environment variables
export const env = parseEnv();
// Export derived configuration
export const appConfig = {
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    server: {
        port: parseInt(env.PORT, 10),
        metrics: {
            enabled: env.ENABLE_METRICS === 'true',
            port: parseInt(env.METRICS_PORT, 10),
        },
    },
    rateLimit: {
        windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
        max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    },
    shopify: {
        shopName: env.SHOPIFY_SHOP_NAME,
        accessToken: env.SHOPIFY_ACCESS_TOKEN,
        apiVersion: env.SHOPIFY_API_VERSION,
        webhookSecret: env.SHOPIFY_WEBHOOK_SECRET,
    },
};
