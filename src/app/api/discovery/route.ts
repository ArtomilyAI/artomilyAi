import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GenerationService } from '@/services/generation.service'
import { GenerationType } from '@prisma/client'

// GET /api/discovery - Get all public generations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') as GenerationType | null

    const result = await GenerationService.getPublicGenerations({
      limit,
      offset,
      type: type || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Discovery fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch discovery content' }, { status: 500 })
  }
}
