import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GenerationService } from '@/services/generation.service'
import { AIService } from '@/services/ai.service'
import { z } from 'zod'

const captionSchema = z.object({
  prompt: z.string().min(1).max(2000),
  type: z.enum(['IMAGE', 'VIDEO']),
})

/**
 * POST /api/generate/caption
 * Synchronously generates caption for image/video (bypasses queue for fast response)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = captionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { prompt, type } = result.data

    // Create contextual prompt for caption
    const contextualPrompt = type === 'IMAGE'
      ? `Write an engaging social media caption for this image. The image was generated based on this prompt: "${prompt}". Include relevant hashtags at the end.`
      : `Write an engaging social media caption for this video. The video was generated based on this prompt: "${prompt}". Include relevant hashtags at the end.`

    // Generate caption synchronously (TEXT is fast)
    const aiResult = await AIService.generateText({
      prompt: contextualPrompt,
      type: 'caption',
    })

    if (aiResult.success && aiResult.result) {
      return NextResponse.json({
        success: true,
        result: aiResult.result,
        metadata: aiResult.metadata,
      })
    } else {
      return NextResponse.json(
        { error: aiResult.error || 'Failed to generate caption' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
