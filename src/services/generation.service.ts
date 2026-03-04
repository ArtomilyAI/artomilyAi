import prisma from '@/lib/db'
import { GenerationType, GenerationStatus } from '@prisma/client'
import { CreditService, CREDIT_COSTS } from './credit.service'

export interface GenerateTextInput {
  userId: string
  prompt: string
  type: GenerationType
}

export interface GenerateTextResult {
  success: boolean
  generationId?: string
  result?: string
  error?: string
  creditsRemaining?: number
}

export interface GenerationWithUser {
  id: string
  userId: string
  type: GenerationType
  prompt: string
  resultUrl: string | null
  cost: number
  status: GenerationStatus
  isPublic: boolean
  metadata: unknown
  createdAt: Date
  updatedAt: Date
}

export class GenerationService {
  /**
   * Get credit cost for generation type
   */
  static getCreditCost(type: GenerationType): number {
    switch (type) {
      case 'TEXT':
        return CREDIT_COSTS.TEXT
      case 'IMAGE':
        return CREDIT_COSTS.IMAGE
      case 'VIDEO':
        return CREDIT_COSTS.VIDEO
      case 'UPSCALE':
        return CREDIT_COSTS.UPSCALE
      default:
        return 1
    }
  }

  /**
   * Create a new generation (pending status)
   * This deducts credits and creates the generation record
   */
  static async createGeneration(
    userId: string,
    type: GenerationType,
    prompt: string
  ): Promise<{ success: boolean; generationId?: string; error?: string }> {
    const cost = this.getCreditCost(type)

    // Check if user has enough credits
    const hasCredits = await CreditService.hasEnoughCredits(userId, cost)
    if (!hasCredits) {
      return {
        success: false,
        error: 'Insufficient credits',
      }
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Deduct credits
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { walletBalance: true },
        })

        if (!user || user.walletBalance < cost) {
          throw new Error('Insufficient credits')
        }

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: cost } },
        })

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId,
            type: 'GENERATION',
            amount: -cost,
            description: `${type} generation`,
          },
        })

        // Create generation record
        const generation = await tx.generation.create({
          data: {
            userId,
            type,
            prompt,
            cost,
            status: GenerationStatus.PENDING,
          },
        })

        return generation
      })

      return {
        success: true,
        generationId: result.id,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create generation',
      }
    }
  }

  /**
   * Update generation status and result
   */
  static async updateGeneration(
    generationId: string,
    data: {
      status: GenerationStatus
      resultUrl?: string
      metadata?: Record<string, unknown>
    }
  ) {
    return prisma.generation.update({
      where: { id: generationId },
      data: {
        status: data.status,
        resultUrl: data.resultUrl,
        metadata: data.metadata as any,
      },
    })
  }

  /**
   * Mark generation as failed and refund credits
   */
  static async failGeneration(generationId: string, reason?: string) {
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
    })

    if (!generation) {
      throw new Error('Generation not found')
    }

    await prisma.$transaction(async (tx) => {
      // Update generation status
      await tx.generation.update({
        where: { id: generationId },
        data: {
          status: GenerationStatus.FAILED,
          metadata: { error: reason },
        },
      })

      // Refund credits
      await tx.user.update({
        where: { id: generation.userId },
        data: { walletBalance: { increment: generation.cost } },
      })

      // Create refund transaction
      await tx.transaction.create({
        data: {
          userId: generation.userId,
          type: 'REFUND',
          amount: generation.cost,
          referenceJobId: generationId,
          description: `Refund for failed ${generation.type} generation`,
        },
      })
    })
  }

  /**
   * Complete generation with result
   */
  static async completeGeneration(
    generationId: string,
    resultUrl: string,
    metadata?: Record<string, unknown>
  ) {
    return this.updateGeneration(generationId, {
      status: GenerationStatus.COMPLETED,
      resultUrl,
      metadata,
    })
  }

  /**
   * Get user's generations
   */
  static async getUserGenerations(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      type?: GenerationType
      status?: GenerationStatus
    }
  ) {
    const where = {
      userId,
      ...(options?.type && { type: options.type }),
      ...(options?.status && { status: options.status }),
    }

    const generations = await prisma.generation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    })

    const total = await prisma.generation.count({ where })

    return {
      generations,
      total,
      hasMore: (options?.offset ?? 0) + generations.length < total,
    }
  }

  /**
   * Get single generation by ID
   */
  static async getGeneration(generationId: string, userId: string) {
    return prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
      },
    })
  }

  /**
   * Toggle generation public status
   */
  static async togglePublic(generationId: string, userId: string) {
    const generation = await prisma.generation.findFirst({
      where: { id: generationId, userId },
    })

    if (!generation) {
      throw new Error('Generation not found')
    }

    return prisma.generation.update({
      where: { id: generationId },
      data: { isPublic: !generation.isPublic },
    })
  }

  /**
   * Set generation public status explicitly
   */
  static async setPublic(generationId: string, userId: string, isPublic: boolean = true) {
    const generation = await prisma.generation.findFirst({
      where: { id: generationId, userId },
    })

    if (!generation) {
      throw new Error('Generation not found')
    }

    if (generation.isPublic === isPublic) {
      return generation
    }

    return prisma.generation.update({
      where: { id: generationId },
      data: { isPublic },
    })
  }

  /**
   * Delete generation
   */
  static async deleteGeneration(generationId: string, userId: string) {
    const generation = await prisma.generation.findFirst({
      where: { id: generationId, userId },
    })

    if (!generation) {
      throw new Error('Generation not found')
    }

    return prisma.generation.delete({
      where: { id: generationId },
    })
  }

  /**
   * Get all public generations (for discovery feed)
   */
  static async getPublicGenerations(options?: {
    limit?: number
    offset?: number
    type?: GenerationType
  }) {
    const where = {
      isPublic: true,
      status: GenerationStatus.COMPLETED,
      resultUrl: { not: null },
      ...(options?.type && { type: options.type }),
    }

    const generations = await prisma.generation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    const total = await prisma.generation.count({ where })

    return {
      generations,
      total,
      hasMore: (options?.offset ?? 0) + generations.length < total,
    }
  }
}
