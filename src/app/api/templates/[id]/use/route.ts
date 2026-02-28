import { NextRequest, NextResponse } from 'next/server'
import { TemplateService } from '@/services/template.service'

// POST /api/templates/[id]/use - Increment template usage count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await TemplateService.incrementUsage(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Template usage increment error:', error)
    return NextResponse.json(
      { error: 'Failed to increment usage' },
      { status: 500 }
    )
  }
}
