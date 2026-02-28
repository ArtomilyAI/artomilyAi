import { NextRequest, NextResponse } from 'next/server'
import { TemplateService } from '@/services/template.service'
import { GenerationType, TemplateCategory } from '@prisma/client'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category') as TemplateCategory | null
    const type = searchParams.get('type') as GenerationType | null
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search') || undefined

    const result = await TemplateService.getTemplates({
      filter: {
        category: category || undefined,
        type: type || undefined,
        tags: tags && tags.length > 0 ? tags : undefined,
        search,
      },
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  prompt: z.string().min(1).max(2000),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'UPSCALE']),
  category: z.enum([
    'RAMADHAN',
    'CHINESE_NEW_YEAR',
    'NATIONAL_DAY',
    'TRENDING_MEME',
    'VIRAL_TEMPLATE',
    'BUSINESS',
    'SOCIAL_MEDIA',
    'MARKETING',
  ]),
  tags: z.array(z.string()).optional(),
  thumbnail: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = createTemplateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const template = await TemplateService.createTemplate({
      name: result.data.name,
      description: result.data.description,
      prompt: result.data.prompt,
      type: result.data.type as GenerationType,
      category: result.data.category as TemplateCategory,
      tags: result.data.tags,
      thumbnail: result.data.thumbnail ?? undefined,
      isPublic: result.data.isPublic,
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
