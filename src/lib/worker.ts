import { Worker, Job } from 'bullmq'
import { GENERATION_QUEUE_NAME, GenerationJobData, GenerationJobResult } from './queue'
import { REDIS_URL } from './redis'
import { AIService } from '@/services/ai.service'
import { GenerationService } from '@/services/generation.service'
import { GenerationStatus } from '@prisma/client'

/**
 * Generation Worker - Processes AI generation jobs from the queue
 *
 * This worker handles:
 * - Text generation (captions, scripts, copywriting)
 * - Image generation (text-to-image, image-to-image)
 * - Video generation (text-to-video, image-to-video)
 * - Image upscaling
 */

// Worker instance
let worker: Worker | null = null

/**
 * Process a single generation job
 */
async function processGenerationJob(
    job: Job<GenerationJobData>
): Promise<GenerationJobResult> {
    const { generationId, userId, type, prompt, options } = job.data

    console.log(`Processing job ${job.id} - Type: ${type}, User: ${userId}`)

    try {
        // Update status to PROCESSING
        await GenerationService.updateGeneration(generationId, {
            status: GenerationStatus.PROCESSING,
        })

        let result: { success: boolean; result?: string; error?: string; metadata?: Record<string, unknown> }

        // Process based on generation type
        switch (type) {
            case 'TEXT': {
                result = await AIService.generateText({
                    prompt,
                    type: options?.textType || 'caption',
                    tone: options?.tone,
                    language: options?.language,
                })
                break
            }

            case 'IMAGE': {
                result = await AIService.generateImage({
                    prompt,
                    style: options?.imageStyle,
                    aspectRatio: options?.aspectRatio,
                    referenceImageUrl: options?.referenceUrl,
                })
                break
            }

            case 'VIDEO': {
                result = await AIService.generateVideo({
                    prompt,
                    duration: options?.duration,
                    referenceImageUrl: options?.referenceUrl,
                })
                break
            }

            case 'UPSCALE': {
                // For upscale, prompt should be the image URL
                result = await AIService.upscaleImage(prompt)
                break
            }

            default:
                throw new Error(`Unknown generation type: ${type}`)
        }

        // Handle result
        if (result.success && result.result) {
            // Mark as completed
            await GenerationService.completeGeneration(
                generationId,
                result.result,
                result.metadata
            )

            console.log(`Job ${job.id} completed successfully`)

            return {
                success: true,
                generationId,
                resultUrl: result.result,
                metadata: result.metadata,
            }
        } else {
            // Generation failed - refund credits
            await GenerationService.failGeneration(
                generationId,
                result.error || 'Generation failed'
            )

            console.log(`Job ${job.id} failed: ${result.error}`)

            return {
                success: false,
                generationId,
                error: result.error || 'Generation failed',
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Mark as failed and refund credits
        try {
            await GenerationService.failGeneration(generationId, errorMessage)
        } catch (failError) {
            console.error(`Failed to mark job ${job.id} as failed:`, failError)
        }

        console.error(`Job ${job.id} error:`, error)

        return {
            success: false,
            generationId,
            error: errorMessage,
        }
    }
}

/**
 * Start the generation worker
 */
export function startGenerationWorker(): Worker {
    if (worker) {
        return worker
    }

    worker = new Worker<GenerationJobData, GenerationJobResult>(
        GENERATION_QUEUE_NAME,
        processGenerationJob,
        {
            connection: {
                url: REDIS_URL,
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
            },
            concurrency: 3, // Process up to 3 jobs concurrently
            limiter: {
                max: 10, // Max 10 jobs per duration
                duration: 1000, // Per 1 second
            },
        }
    )

    // Event handlers
    worker.on('completed', (job: Job<GenerationJobData>, result: GenerationJobResult) => {
        console.log(`Job ${job.id} completed with result:`, result.success ? 'SUCCESS' : 'FAILED')
    })

    worker.on('failed', (job: Job<GenerationJobData> | undefined, err: Error) => {
        console.error(`Job ${job?.id} failed with error:`, err.message)
    })

    worker.on('error', (err: Error) => {
        console.error('Worker error:', err)
    })

    worker.on('stalled', (jobId: string) => {
        console.warn(`Job ${jobId} stalled`)
    })

    console.log('Generation worker started')

    return worker
}

/**
 * Stop the generation worker
 */
export async function stopGenerationWorker(): Promise<void> {
    if (worker) {
        await worker.close()
        worker = null
        console.log('Generation worker stopped')
    }
}

/**
 * Get worker status
 */
export function getWorkerStatus() {
    if (!worker) {
        return { running: false }
    }

    return {
        running: true,
        isRunning: worker.isRunning(),
        isPaused: worker.isPaused(),
    }
}

// For standalone worker process (optional - can be run as separate process)
if (require.main === module) {
    console.log('Starting generation worker as standalone process...')

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
        console.log('Shutting down worker...')
        await stopGenerationWorker()
        process.exit(0)
    }

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)

    // Start the worker
    startGenerationWorker()
}
