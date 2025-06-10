export const QUEUE_NAMES = {
    EMAIL: 'email',
    WEBHOOK: 'webhook-processing',
    PRODUCT_SYNC: 'product-sync',
    BACKGROUND: 'background-tasks',
    ORDER_PROCESSING: 'order-processing',
    NOTIFICATIONS: 'notifications',
};
export const JOB_NAMES = {
    SEND_EMAIL: 'send-email',
    SEND_BULK_EMAIL: 'send-bulk-email',
    PROCESS_WEBHOOK: 'process-webhook',
    VERIFY_WEBHOOK: 'verify-webhook',
    SYNC_PRODUCT: 'sync-product',
    SYNC_ALL_PRODUCTS: 'sync-all-products',
    CLEANUP_DATA: 'cleanup-data',
    GENERATE_REPORT: 'generate-report',
    PROCESS_ORDER: 'process-order',
    FULFILL_ORDER: 'fulfill-order',
    SEND_NOTIFICATION: 'send-notification',
};
