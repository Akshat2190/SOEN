import Redis from 'ioredis';

const hasRedisConfig = process.env.REDIS_URL || process.env.REDIS_HOST;

const redisClient = hasRedisConfig ? new Redis(process.env.REDIS_URL || {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
}) : {
    async get() {
        return null;
    },
    async set() {
        return null;
    },
    on() {},
};


redisClient.on('connect', () => {
    console.log('Redis connected');
});

redisClient.on('error', (error) => {
    console.error('Redis error:', error.message);
});

if (!hasRedisConfig) {
    console.warn('Redis is not configured. Token blacklist is disabled.');
}

export default redisClient;
