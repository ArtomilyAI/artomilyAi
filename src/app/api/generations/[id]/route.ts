import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GenerationService } from '@/services/generation.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const generation = await GenerationService.getGeneration(id, session.user.id)

    if (!generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    return NextResponse.json(generation)
  } catch (error) {
    console.error('Get generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const generation = await GenerationService.togglePublic(id, session.user.id)

    return NextResponse.json(generation)
  } catch (error) {
    console.error('Toggle generation error:', error)
    if (error instanceof Error && error.message === 'Generation not found') {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await GenerationService.deleteGeneration(id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete generation error:', error)
    if (error instanceof Error && error.message === 'Generation not found') {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
