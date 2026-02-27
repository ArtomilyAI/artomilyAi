import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GenerationService } from '@/services/generation.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const result = await GenerationService.getUserGenerations(session.user.id, {
      limit,
      offset,
      type: type as any || undefined,
      status: status as any || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get generations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
