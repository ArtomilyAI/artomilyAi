import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/share/[id] - Get shared generation (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const generation = await prisma.generation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    if (!generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: generation.id,
      type: generation.type,
      prompt: generation.prompt,
      resultUrl: generation.resultUrl,
      cost: generation.cost,
      status: generation.status,
      createdAt: generation.createdAt,
      user: generation.user,
    })
  } catch (error) {
    console.error('Share fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch shared content' }, { status: 500 })
  }
}
