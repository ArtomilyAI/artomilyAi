import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GenerationService } from '@/services/generation.service'
import { AIService } from '@/services/ai.service'
import { z } from 'zod'

const generateSchema = z.object({
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'UPSCALE']),
  prompt: z.string().min(1).max(2000),
  textType: z.enum(['caption', 'script', 'copywriting']).optional(),
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

    const { type, prompt, textType } = result.data

    // Create generation (deducts credits)
    const createResult = await GenerationService.createGeneration(
      session.user.id,
      type as any,
      prompt
    )

    if (!createResult.success) {
      return NextResponse.json(
        { error: createResult.error },
        { status: 400 }
      )
    }

    // Process generation (in production, this would be queued)
    // For now, we'll process synchronously for TEXT type
    if (type === 'TEXT') {
      try {
        const textResult = await AIService.generateText({
          prompt,
          type: textType || 'caption',
        })

        await GenerationService.completeGeneration(
          createResult.generationId!,
          textResult,
          { model: 'mock', characterCount: textResult.length }
        )

        return NextResponse.json({
          success: true,
          generationId: createResult.generationId,
          result: textResult,
        })
      } catch (error) {
        await GenerationService.failGeneration(
          createResult.generationId!,
          error instanceof Error ? error.message : 'Generation failed'
        )
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Generation failed' },
          { status: 500 }
        )
      }
    }

    // For IMAGE and VIDEO, return pending status (would be processed by queue)
    return NextResponse.json({
      success: true,
      generationId: createResult.generationId,
      status: 'PENDING',
      message: 'Generation queued for processing',
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
