import { Plan, SubscriptionStatus } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      plan: Plan
      walletBalance: number
      username?: string | null
    } & DefaultSession['user']
  }

  interface User {
    plan: Plan
    walletBalance: number
    username?: string | null
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    plan: Plan
    walletBalance: number
    username?: string | null
  }
}
