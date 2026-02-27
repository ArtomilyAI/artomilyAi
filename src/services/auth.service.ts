import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { Plan } from "@prisma/client"
import { PLAN_CREDITS } from "@/services/credit.service"
import { TransactionType } from "@prisma/client"

export interface RegisterInput {
  email: string
  password: string
  username?: string
  name?: string
}

export interface RegisterResult {
  success: boolean
  userId?: string
  error?: string
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<RegisterResult> {
    const { email, password, username, name } = input

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
      }
    }

    // Check if username is taken
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      })

      if (existingUsername) {
        return {
          success: false,
          error: "Username already taken",
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with initial credits
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
          name,
          plan: Plan.FREE,
          walletBalance: PLAN_CREDITS.FREE,
        },
      })

      // Create initial transaction for free credits
      await tx.transaction.create({
        data: {
          userId: newUser.id,
          type: TransactionType.MONTHLY_ALLOCATION,
          amount: PLAN_CREDITS.FREE,
          description: "Initial free credits",
        },
      })

      // Create subscription record
      await tx.subscription.create({
        data: {
          userId: newUser.id,
        },
      })

      return newUser
    })

    return {
      success: true,
      userId: user.id,
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        image: true,
        plan: true,
        walletBalance: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        createdAt: true,
      },
    })
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: {
      name?: string
      username?: string
      image?: string
    }
  ) {
    // Check if username is taken
    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId },
        },
      })

      if (existingUser) {
        throw new Error("Username already taken")
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        image: true,
      },
    })
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user || !user.password) {
      throw new Error("User not found")
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { success: true }
  }
}
