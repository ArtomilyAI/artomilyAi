import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GenerationService } from '@/services/generation.service'
import { AIService } from '@/services/ai.service'
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

    const { type, prompt, textType, tone, language, imageStyle, aspectRatio, duration } = result.data

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

    // Process based on type
    switch (type) {
      case 'TEXT': {
        const aiResult = await AIService.generateText({
          prompt,
          type: textType || 'caption',
          tone,
          language,
        })

        if (aiResult.success && aiResult.result) {
          await GenerationService.completeGeneration(
            createResult.generationId!,
            aiResult.result,
            aiResult.metadata
          )
          return NextResponse.json({
            success: true,
            generationId: createResult.generationId,
            result: aiResult.result,
            metadata: aiResult.metadata,
          })
        } else {
          await GenerationService.failGeneration(createResult.generationId!, aiResult.error)
          return NextResponse.json({ error: aiResult.error }, { status: 500 })
        }
      }

      case 'IMAGE': {
        const aiResult = await AIService.generateImage({
          prompt,
          style: imageStyle,
          aspectRatio,
        })

        if (aiResult.success && aiResult.result) {
          await GenerationService.completeGeneration(
            createResult.generationId!,
            aiResult.result,
            aiResult.metadata
          )
          return NextResponse.json({
            success: true,
            generationId: createResult.generationId,
            result: aiResult.result,
            metadata: aiResult.metadata,
          })
        } else {
          await GenerationService.failGeneration(createResult.generationId!, aiResult.error)
          return NextResponse.json({ error: aiResult.error }, { status: 500 })
        }
      }

      case 'VIDEO': {
        // Video generation is async - start processing and return pending
        // In production, this would be handled by a job queue
        const aiResult = await AIService.generateVideo({
          prompt,
          duration,
        })

        if (aiResult.success && aiResult.result) {
          await GenerationService.completeGeneration(
            createResult.generationId!,
            aiResult.result,
            aiResult.metadata
          )
          return NextResponse.json({
            success: true,
            generationId: createResult.generationId,
            result: aiResult.result,
            metadata: aiResult.metadata,
          })
        } else {
          await GenerationService.failGeneration(createResult.generationId!, aiResult.error)
          return NextResponse.json({ error: aiResult.error }, { status: 500 })
        }
      }

      case 'UPSCALE': {
        // For upscale, prompt should be the image URL
        const aiResult = await AIService.upscaleImage(prompt)

        if (aiResult.success && aiResult.result) {
          await GenerationService.completeGeneration(
            createResult.generationId!,
            aiResult.result,
            aiResult.metadata
          )
          return NextResponse.json({
            success: true,
            generationId: createResult.generationId,
            result: aiResult.result,
            metadata: aiResult.metadata,
          })
        } else {
          await GenerationService.failGeneration(createResult.generationId!, aiResult.error)
          return NextResponse.json({ error: aiResult.error }, { status: 500 })
        }
      }

      default:
        return NextResponse.json({ error: 'Unknown generation type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
