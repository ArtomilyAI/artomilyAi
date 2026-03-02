import Redis from 'ioredis'

// Redis connection URL from environment
export const REDIS_URL =
    process.env.REDIS_URL || ""

// Redis connection options for BullMQ
export const redisConnectionOptions = {
    maxRetriesPerRequest: null as null, // Required for BullMQ
    enableReadyCheck: false,
}

// Singleton Redis client for direct use
let redisClient: Redis | null = null

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis(REDIS_URL, redisConnectionOptions)

        redisClient.on('error', (err) => {
            console.error('Redis connection error:', err)
        })

        redisClient.on('connect', () => {
            console.log('Redis connected successfully')
        })
    }

    return redisClient
}

// For cleanup on shutdown
export async function closeRedisConnection(): Promise<void> {
    if (redisClient) {
        await redisClient.quit()
        redisClient = null
    }
}
