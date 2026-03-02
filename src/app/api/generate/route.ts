import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GenerationService } from '@/services/generation.service'
import { addGenerationJob, GenerationType, getJobPriority } from '@/lib/queue'
import { startGenerationWorker } from '@/lib/worker'
import { z } from 'zod'

const generateSchema = z.object({
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'UPSCALE']),
  prompt: z.string().min(1).max(2000),
  // Text options
  textType: z.enum(['caption', 'script', 'copywriting']).optional(),
  tone: z.string().max(50).optional(),
  language: z.string().max(50).optional(),
  // Image options
  imageStyle: z.string().max(100).optional(),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3']).optional(),
  // Video options
  duration: z.number().min(1).max(30).optional(),
  // Reference image for image-to-image or image-to-video
  referenceUrl: z.string().min(1).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = generateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { type, prompt, textType, tone, language, imageStyle, aspectRatio, duration, referenceUrl } = result.data

    // Create generation (deducts credits)
    const createResult = await GenerationService.createGeneration(
      session.user.id,
      type as GenerationType,
      prompt
    )

    if (!createResult.success) {
      return NextResponse.json(
        { error: createResult.error },
        { status: 400 }
      )
    }

    // Ensure worker is running (for development / serverless environments)
    // In production, the worker should be running as a separate process
    try {
      startGenerationWorker()
    } catch (workerError) {
      console.log('Worker already running or failed to start:', workerError)
    }

    // Add job to queue for background processing
    await addGenerationJob(
      {
        generationId: createResult.generationId!,
        userId: session.user.id,
        type: type as GenerationType,
        prompt,
        options: {
          textType,
          tone,
          language,
          imageStyle,
          aspectRatio,
          duration,
          referenceUrl,
        },
      },
      getJobPriority(session.user.plan)
    )

    // Return immediately with generation ID
    // The client can poll for status or use WebSocket for updates
    return NextResponse.json({
      success: true,
      generationId: createResult.generationId,
      status: 'PENDING',
      message: 'Generation job queued successfully',
      // Provide a URL to check status
      statusUrl: `/api/generate/status/${createResult.generationId}`,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
