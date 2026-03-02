import { Queue, QueueEvents, ConnectionOptions } from 'bullmq'
import { REDIS_URL } from './redis'
import { GenerationType } from '@prisma/client'

// Re-export GenerationType for convenience
export { GenerationType }

// Queue name for generation jobs
export const GENERATION_QUEUE_NAME = 'generation-queue'

// Job data type for generation jobs
export interface GenerationJobData {
    generationId: string
    userId: string
    type: GenerationType
    prompt: string
    options?: {
        // Text options
        textType?: 'caption' | 'script' | 'copywriting'
        tone?: string
        language?: string
        // Image options
        imageStyle?: string
        aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3'
        // Video options
        duration?: number
        // Reference for image-to-image or image-to-video
        referenceUrl?: string
    }
}

// Job result type
export interface GenerationJobResult {
    success: boolean
    generationId: string
    resultUrl?: string
    error?: string
    metadata?: Record<string, unknown>
}

// Connection options for BullMQ
const bullMQConnection: ConnectionOptions = {
    url: REDIS_URL,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
}

// Singleton queue instance
let generationQueue: Queue | null = null
let queueEvents: QueueEvents | null = null

export function getGenerationQueue(): Queue {
    if (!generationQueue) {
        generationQueue = new Queue(GENERATION_QUEUE_NAME, {
            connection: bullMQConnection,
            defaultJobOptions: {
                attempts: 3, // Retry up to 3 times
                backoff: {
                    type: 'exponential',
                    delay: 1000, // Start with 1 second
                },
                removeOnComplete: {
                    count: 100, // Keep last 100 completed jobs
                    age: 24 * 3600, // Or 24 hours
                },
                removeOnFail: {
                    count: 500, // Keep last 500 failed jobs
                    age: 7 * 24 * 3600, // Or 7 days
                },
            },
        })
    }

    return generationQueue
}

export function getQueueEvents(): QueueEvents {
    if (!queueEvents) {
        queueEvents = new QueueEvents(GENERATION_QUEUE_NAME, {
            connection: bullMQConnection,
        })
    }

    return queueEvents
}

// Queue priority based on user plan (for future use)
export type QueuePriority = 'high' | 'normal' | 'low'

export function getJobPriority(userPlan?: string): number {
    switch (userPlan) {
        case 'PRO_BRAND':
            return 1 // Highest priority
        case 'CREATOR':
            return 5
        default:
            return 10 // Normal priority for free users
    }
}

// Add a generation job to the queue
export async function addGenerationJob(
    data: GenerationJobData,
    priority?: number
): Promise<{ jobId: string }> {
    const queue = getGenerationQueue()

    const job = await queue.add('generate', data, {
        priority: priority ?? getJobPriority(),
        jobId: data.generationId, // Use generation ID as job ID for easy tracking
    })

    return { jobId: job.id! }
}

// Get job status
export async function getJobStatus(jobId: string) {
    const queue = getGenerationQueue()
    const job = await queue.getJob(jobId)

    if (!job) {
        return null
    }

    return {
        id: job.id,
        status: await job.getState(),
        progress: job.progress,
        returnValue: job.returnvalue,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
    }
}

// Clean up function for shutdown
export async function closeQueue(): Promise<void> {
    if (queueEvents) {
        await queueEvents.close()
        queueEvents = null
    }
    if (generationQueue) {
        await generationQueue.close()
        generationQueue = null
    }
}
