import { NextRequest, NextResponse } from 'next/server'
import { TemplateService } from '@/services/template.service'
import { GenerationType, TemplateCategory } from '@prisma/client'
import { z } from 'zod'
import { auth } from '@/lib/auth'

// Helper: admin guard
async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized', status: 401 }
  if (session.user.role !== 'ADMIN') return { error: 'Forbidden: admin only', status: 403 }
  return { session }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const template = await TemplateService.getTemplate(id)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    return NextResponse.json(template)
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  prompt: z.string().min(1).max(2000).optional(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'UPSCALE']).optional(),
  category: z
    .enum([
      'RAMADHAN',
      'CHINESE_NEW_YEAR',
      'NATIONAL_DAY',
      'TRENDING_MEME',
      'VIRAL_TEMPLATE',
      'BUSINESS',
      'SOCIAL_MEDIA',
      'MARKETING',
    ])
    .optional(),
  tags: z.array(z.string()).optional(),
  thumbnail: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if ('error' in guard) {
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    const { id } = await params
    const existing = await TemplateService.getTemplate(id)
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const body = await request.json()
    const result = updateTemplateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const updated = await TemplateService.updateTemplate(id, {
      ...result.data,
      type: result.data.type as GenerationType | undefined,
      category: result.data.category as TemplateCategory | undefined,
      description: result.data.description ?? undefined,
      thumbnail: result.data.thumbnail ?? undefined,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if ('error' in guard) {
      return NextResponse.json({ error: guard.error }, { status: guard.status })
    }

    const { id } = await params
    const existing = await TemplateService.getTemplate(id)
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    await TemplateService.deleteTemplate(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
