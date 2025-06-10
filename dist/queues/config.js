"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvironmentConfig = exports.workerConfig = exports.queueConfigs = exports.defaultJobOptions = exports.redisConnection = void 0;
exports.redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: 3,
    lazyConnect: true,
};
exports.defaultJobOptions = {
    removeOnComplete: 10,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000,
    },
};
exports.queueConfigs = {
    webhook: {
        ...exports.defaultJobOptions,
        attempts: 5,
        priority: 10,
    },
    email: {
        ...exports.defaultJobOptions,
        attempts: 3,
        priority: 5,
    },
    productSync: {
        ...exports.defaultJobOptions,
        attempts: 2,
        priority: 1,
    },
    background: {
        ...exports.defaultJobOptions,
        attempts: 1,
        priority: 0,
    },
};
exports.workerConfig = {
    concurrency: {
        webhook: 3,
        email: 5,
        productSync: 2,
        background: 1,
    },
    connection: exports.redisConnection,
    stalledInterval: 30000,
    maxStalledCount: 1,
};
const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    switch (env) {
        case 'production':
            return {
                ...exports.defaultJobOptions,
                removeOnComplete: 50,
                removeOnFail: 100,
            };
        case 'test':
            return {
                ...exports.defaultJobOptions,
                removeOnComplete: 1,
                removeOnFail: 1,
                attempts: 1,
            };
        default:
            return exports.defaultJobOptions;
    }
};
exports.getEnvironmentConfig = getEnvironmentConfig;
