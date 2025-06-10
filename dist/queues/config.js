export const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: 3,
    lazyConnect: true,
};
export const defaultJobOptions = {
    removeOnComplete: 10,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000,
    },
};
export const queueConfigs = {
    webhook: {
        ...defaultJobOptions,
        attempts: 5,
        priority: 10,
    },
    email: {
        ...defaultJobOptions,
        attempts: 3,
        priority: 5,
    },
    productSync: {
        ...defaultJobOptions,
        attempts: 2,
        priority: 1,
    },
    background: {
        ...defaultJobOptions,
        attempts: 1,
        priority: 0,
    },
};
export const workerConfig = {
    concurrency: {
        webhook: 3,
        email: 5,
        productSync: 2,
        background: 1,
    },
    connection: redisConnection,
    stalledInterval: 30000,
    maxStalledCount: 1,
};
export const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    switch (env) {
        case 'production':
            return {
                ...defaultJobOptions,
                removeOnComplete: 50,
                removeOnFail: 100,
            };
        case 'test':
            return {
                ...defaultJobOptions,
                removeOnComplete: 1,
                removeOnFail: 1,
                attempts: 1,
            };
        default:
            return defaultJobOptions;
    }
};
