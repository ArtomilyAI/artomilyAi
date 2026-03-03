import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CreditService } from '@/services/credit.service'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const balance = await CreditService.getBalance(session.user.id)

  return (
    <DashboardShell
      balance={balance}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </DashboardShell>
  )
}
