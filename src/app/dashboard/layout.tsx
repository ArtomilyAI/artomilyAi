import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#111421] text-slate-900 dark:text-slate-100 font-sans">
      {/* Header - matching template design */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111421]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-[#506ced] p-1.5 rounded-lg text-white">
              <span className="block text-lg">✨</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">ArtomilyAI</h1>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Link 
                href="/dashboard" 
                className="hover:text-[#506ced] transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/library" 
                className="hover:text-[#506ced] transition-colors"
              >
                History
              </Link>
              <Link 
                href="/dashboard/templates" 
                className="hover:text-[#506ced] transition-colors"
              >
                Templates
              </Link>
            </nav>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 dark:border-slate-800" />

            {/* Credit Balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#506ced]/10 rounded-full border border-[#506ced]/20">
              <span className="text-sm text-[#506ced]">💎</span>
              <span className="text-xs font-bold text-[#506ced]">{balance} Credits Left</span>
            </div>

            {/* User Avatar */}
            <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-800">
              <Avatar className="size-full">
                <AvatarImage src={session.user.image || ''} />
                <AvatarFallback className="bg-[#506ced]/10 text-[#506ced] font-semibold text-sm">
                  {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>©</span>
            <span className="text-sm">2025 ArtomilyAI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8">
            <a className="text-sm text-slate-500 hover:text-[#506ced] transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-slate-500 hover:text-[#506ced] transition-colors" href="#">Terms of Service</a>
            <a className="text-sm text-slate-500 hover:text-[#506ced] transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
