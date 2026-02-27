import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CreditService } from '@/services/credit.service'

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ArtomilyAI
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Credit Balance */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <span className="text-sm font-medium text-muted-foreground">Credits:</span>
              <span className="text-lg font-bold text-purple-600">{balance}</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={session.user.image || ''} />
                <AvatarFallback>
                  {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{session.user.name || session.user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{session.user.plan.toLowerCase()}</p>
              </div>
            </div>

            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
