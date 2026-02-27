import prisma from '@/lib/db'
import { TransactionType } from '@prisma/client'

// Credit costs per action type
export const CREDIT_COSTS = {
  TEXT: 1,
  IMAGE: 5,
  VIDEO: 20,
  UPSCALE: 3,
} as const

// Monthly credit allocation per plan
export const PLAN_CREDITS = {
  FREE: 20,
  CREATOR: 300,
  PRO_BRAND: 1000,
} as const

export class CreditService {
  /**
   * Get user's current wallet balance
   */
  static async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    })
    return user?.walletBalance ?? 0
  }

  /**
   * Check if user has enough credits
   */
  static async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId)
    return balance >= amount
  }

  /**
   * Deduct credits from user's wallet
   * Returns transaction ID if successful, throws error if insufficient balance
   */
  static async deductCredits(
    userId: string,
    amount: number,
    referenceJobId?: string,
    description?: string
  ): Promise<string> {
    return await prisma.$transaction(async (tx) => {
      // Get current user with lock
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (user.walletBalance < amount) {
        throw new Error('Insufficient credits')
      }

      // Deduct from wallet
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            decrement: amount,
          },
        },
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.GENERATION,
          amount: -amount,
          referenceJobId,
          description,
        },
      })

      return transaction.id
    })
  }

  /**
   * Refund credits to user's wallet
   */
  static async refundCredits(
    userId: string,
    amount: number,
    referenceJobId?: string,
    description?: string
  ): Promise<string> {
    return await prisma.$transaction(async (tx) => {
      // Add to wallet
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: amount,
          },
        },
      })

      // Create refund transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.REFUND,
          amount: amount,
          referenceJobId,
          description: description ?? 'Refund for failed generation',
        },
      })

      return transaction.id
    })
  }

  /**
   * Add credits to user's wallet (top-up or subscription)
   */
  static async addCredits(
    userId: string,
    amount: number,
    type: TransactionType = TransactionType.TOP_UP,
    description?: string
  ): Promise<string> {
    return await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: amount,
          },
        },
      })

      const transaction = await tx.transaction.create({
        data: {
          userId,
          type,
          amount,
          description,
        },
      })

      return transaction.id
    })
  }

  /**
   * Get user's transaction history
   */
  static async getTransactionHistory(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    })

    const total = await prisma.transaction.count({
      where: { userId },
    })

    return {
      transactions,
      total,
      hasMore: (options?.offset ?? 0) + transactions.length < total,
    }
  }
}
