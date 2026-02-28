import { NextResponse } from 'next/server'
import { TemplateService } from '@/services/template.service'

export async function POST() {
  try {
    const result = await TemplateService.seedDefaultTemplates()
    return NextResponse.json({
      success: true,
      message: 'Templates seeded successfully',
      ...result,
    })
  } catch (error) {
    console.error('Seed templates error:', error)
    return NextResponse.json(
      { error: 'Failed to seed templates' },
      { status: 500 }
    )
  }
}
