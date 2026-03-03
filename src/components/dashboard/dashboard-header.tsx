"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserNav } from "@/components/dashboard/user-nav"
import { Gem } from "lucide-react"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  balance?: number
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { isMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 size-8" />

        {/* Page breadcrumb area - can be extended later */}
        <div className="flex-1" />

        {/* User profile dropdown */}
        <UserNav user={user} />
      </div>
    </header>
  )
}
