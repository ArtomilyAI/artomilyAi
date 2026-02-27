import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { CreditService } from '@/services/credit.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const balance = await CreditService.getBalance(session.user.id)
    const transactions = await CreditService.getTransactionHistory(session.user.id, { limit: 10 })

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        username: session.user.username,
        plan: session.user.plan,
      },
      wallet: {
        balance,
      },
      recentTransactions: transactions,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
