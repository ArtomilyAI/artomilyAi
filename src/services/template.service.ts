import prisma from '@/lib/db'
import { GenerationType, TemplateCategory } from '@prisma/client'

export interface TemplateData {
  name: string
  description?: string
  prompt: string
  type: GenerationType
  category: TemplateCategory
  tags?: string[]
  thumbnail?: string
  isPublic?: boolean
}

export interface TemplateFilter {
  category?: TemplateCategory
  type?: GenerationType
  tags?: string[]
  search?: string
}

export class TemplateService {
  /**
   * Get all public templates with optional filtering
   */
  static async getTemplates(options?: {
    filter?: TemplateFilter
    limit?: number
    offset?: number
  }) {
    const where: any = {
      isPublic: true,
    }

    if (options?.filter?.category) {
      where.category = options.filter.category
    }
    if (options?.filter?.type) {
      where.type = options.filter.type
    }
    if (options?.filter?.tags && options.filter.tags.length > 0) {
      where.tags = { hasSome: options.filter.tags }
    }
    if (options?.filter?.search) {
      where.OR = [
        { name: { contains: options.filter.search } },
        { description: { contains: options.filter.search } },
        { prompt: { contains: options.filter.search } },
      ]
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    })

    const total = await prisma.template.count({ where })

    return {
      templates,
      total,
      hasMore: (options?.offset ?? 0) + templates.length < total,
    }
  }

  /**
   * Get a single template by ID
   */
  static async getTemplate(templateId: string) {
    return prisma.template.findUnique({
      where: { id: templateId },
    })
  }

  /**
   * Create a new template (admin only in production)
   */
  static async createTemplate(data: TemplateData) {
    return prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        type: data.type,
        category: data.category,
        tags: data.tags ?? [],
        thumbnail: data.thumbnail,
        isPublic: data.isPublic ?? true,
      },
    })
  }

  /**
   * Update a template
   */
  static async updateTemplate(templateId: string, data: Partial<TemplateData>) {
    return prisma.template.update({
      where: { id: templateId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.prompt && { prompt: data.prompt }),
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.tags && { tags: data.tags }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
    })
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(templateId: string) {
    return prisma.template.delete({
      where: { id: templateId },
    })
  }

  /**
   * Increment usage count when template is used
   */
  static async incrementUsage(templateId: string) {
    return prisma.template.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    })
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(category: TemplateCategory, limit = 10) {
    return prisma.template.findMany({
      where: {
        isPublic: true,
        category,
      },
      orderBy: { usageCount: 'desc' },
      take: limit,
    })
  }

  /**
   * Get trending templates (most used)
   */
  static async getTrendingTemplates(limit = 10) {
    return prisma.template.findMany({
      where: { isPublic: true },
      orderBy: { usageCount: 'desc' },
      take: limit,
    })
  }

  /**
   * Process template prompt with variables
   * Example: "Create a {style} image of {subject}" with { style: "cinematic", subject: "sunset" }
   */
  static processPrompt(template: string, variables: Record<string, string>): string {
    let processedPrompt = template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g')
      processedPrompt = processedPrompt.replace(regex, value)
    }
    return processedPrompt
  }

  /**
   * Extract variables from template prompt
   * Returns array of variable names found in {variable} format
   */
  static extractVariables(template: string): string[] {
    const regex = /\{([^}]+)\}/g
    const variables: string[] = []
    let match
    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1])
      }
    }
    return variables
  }

  /**
   * Seed default templates
   */
  static async seedDefaultTemplates() {
    const defaultTemplates: TemplateData[] = [
      // Ramadhan templates
      {
        name: 'Ramadhan Greeting',
        description: 'Beautiful Ramadhan greeting card with crescent moon',
        prompt: 'A beautiful Ramadhan greeting card with crescent moon, lanterns, and Islamic patterns, warm golden colors, elegant typography, festive atmosphere',
        type: 'IMAGE',
        category: 'RAMADHAN',
        tags: ['ramadhan', 'islamic', 'greeting', 'festive'],
      },
      {
        name: 'Ramadhan Social Post',
        description: 'Ramadhan themed social media post',
        prompt: 'Create a warm and spiritual social media post for Ramadhan. Include blessings message and motivational quote about patience and devotion.',
        type: 'TEXT',
        category: 'RAMADHAN',
        tags: ['ramadhan', 'social', 'blessing'],
      },
      // Chinese New Year templates
      {
        name: 'Chinese New Year Card',
        description: 'Chinese New Year celebration card with traditional elements',
        prompt: 'Chinese New Year celebration card with red lanterns, golden dragons, cherry blossoms, traditional Chinese patterns, festive red and gold colors',
        type: 'IMAGE',
        category: 'CHINESE_NEW_YEAR',
        tags: ['cny', 'chinese', 'lunar', 'celebration', 'dragon'],
      },
      {
        name: 'Gong Xi Fa Cai Post',
        description: 'Chinese New Year social media caption',
        prompt: 'Create a festive Chinese New Year caption with prosperity wishes and good fortune blessings. Include relevant hashtags.',
        type: 'TEXT',
        category: 'CHINESE_NEW_YEAR',
        tags: ['cny', 'greeting', 'prosperity'],
      },
      // National Day templates
      {
        name: 'National Day Poster',
        description: 'Patriotic national day celebration poster',
        prompt: 'National Day celebration poster with flag colors, patriotic symbols, fireworks, celebratory atmosphere, pride and unity theme',
        type: 'IMAGE',
        category: 'NATIONAL_DAY',
        tags: ['national', 'patriotic', 'celebration', 'flag'],
      },
      // Business templates
      {
        name: 'Professional LinkedIn Post',
        description: 'Professional business post for LinkedIn',
        prompt: 'Create a professional LinkedIn post about {topic}. Keep it insightful, engaging, and suitable for business audience. Include relevant hashtags.',
        type: 'TEXT',
        category: 'BUSINESS',
        tags: ['linkedin', 'professional', 'business', 'networking'],
      },
      {
        name: 'Product Announcement',
        description: 'Product launch announcement post',
        prompt: 'Exciting product announcement post for {product}. Highlight key features and benefits. Create urgency and call to action.',
        type: 'TEXT',
        category: 'MARKETING',
        tags: ['product', 'launch', 'announcement', 'marketing'],
      },
      // Social Media templates
      {
        name: 'Instagram Carousel',
        description: 'Engaging Instagram carousel post',
        prompt: 'Create an engaging Instagram carousel caption about {topic}. Include swipe call-to-action and relevant hashtags.',
        type: 'TEXT',
        category: 'SOCIAL_MEDIA',
        tags: ['instagram', 'carousel', 'engagement'],
      },
      {
        name: 'TikTok Hook',
        description: 'Viral TikTok video hook',
        prompt: 'Create a viral TikTok video script hook for {topic}. Include attention-grabbing opening, trending elements, and call to action.',
        type: 'TEXT',
        category: 'SOCIAL_MEDIA',
        tags: ['tiktok', 'viral', 'hook', 'trending'],
      },
      // Trending templates
      {
        name: 'Meme Template',
        description: 'Trending meme format',
        prompt: 'Create a funny and relatable meme caption about {topic}. Keep it short, punchy, and shareable.',
        type: 'TEXT',
        category: 'TRENDING_MEME',
        tags: ['meme', 'funny', 'trending', 'viral'],
      },
    ]

    for (const template of defaultTemplates) {
      const exists = await prisma.template.findFirst({
        where: { name: template.name },
      })
      if (!exists) {
        await this.createTemplate(template)
      }
    }

    return { seeded: defaultTemplates.length }
  }
}
