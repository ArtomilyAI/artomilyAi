import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GenerationService } from '@/services/generation.service'
import { getJobStatus } from '@/lib/queue'

/**
 * GET /api/generate/status/[id]
 * Check the status of a generation job
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Get generation from database
        const generation = await GenerationService.getGeneration(id, session.user.id)

        if (!generation) {
            return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
        }

        // Get job status from queue (for more detailed status)
        const jobStatus = await getJobStatus(id)

        // Build response
        const response = {
            id: generation.id,
            type: generation.type,
            status: generation.status,
            prompt: generation.prompt,
            resultUrl: generation.resultUrl,
            cost: generation.cost,
            isPublic: generation.isPublic,
            metadata: generation.metadata,
            createdAt: generation.createdAt,
            updatedAt: generation.updatedAt,
            // Additional queue info if available
            queue: jobStatus
                ? {
                    state: jobStatus.status,
                    progress: jobStatus.progress,
                    failedReason: jobStatus.failedReason,
                }
                : null,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Status check error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
