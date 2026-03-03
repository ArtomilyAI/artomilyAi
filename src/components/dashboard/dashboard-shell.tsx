"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface DashboardShellProps {
  children: React.ReactNode
  balance: number
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardShell({ children, balance, user }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar balance={balance} />
      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        <DashboardHeader user={user} />
        <div className="flex-1 overflow-y-auto">
          <main className="px-4 sm:px-6 py-6">
            {children}
          </main>
          {/* Footer */}
          <footer className="px-4 sm:px-6 py-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">© 2025 ArtomilyAI. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-6">
                <a className="text-xs text-muted-foreground hover:text-[#506ced] transition-colors" href="#">Privacy</a>
                <a className="text-xs text-muted-foreground hover:text-[#506ced] transition-colors" href="#">Terms</a>
                <a className="text-xs text-muted-foreground hover:text-[#506ced] transition-colors" href="#">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
