#!/usr/bin/env node
/**
 * Standalone Generation Worker
 *
 * This script starts the generation worker as a separate process.
 * Run with: npx tsx scripts/worker.ts
 *
 * In production, this should be run as a separate service/process.
 * For development, the worker is automatically started within the Next.js API route.
 */

// Load environment variables FIRST before any other imports
import 'dotenv/config'

import { startGenerationWorker, stopGenerationWorker } from '@/lib/worker'
import { closeQueue } from '@/lib/queue'
import { closeRedisConnection } from '@/lib/redis'

console.log('========================================')
console.log('  ArtomilyAI Generation Worker')
console.log('========================================')
console.log('')

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down worker...`)

    try {
        await stopGenerationWorker()
        await closeQueue()
        await closeRedisConnection()
        console.log('Worker shutdown complete')
        process.exit(0)
    } catch (error) {
        console.error('Error during shutdown:', error)
        process.exit(1)
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error)
    gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason)
})

// Start the worker
console.log('Starting generation worker...')
console.log('Redis URL:', process.env.REDIS_URL ? 'Configured' : 'Not configured')
console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...' || 'Not configured')
console.log('')

try {
    startGenerationWorker()
    console.log('Worker started successfully!')
    console.log('Waiting for jobs...')
    console.log('')
} catch (error) {
    console.error('Failed to start worker:', error)
    process.exit(1)
}

// Keep the process alive
process.stdin.resume()
