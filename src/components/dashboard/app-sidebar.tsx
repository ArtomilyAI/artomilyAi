"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  History,
  LayoutTemplate,
  Sparkles,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "History",
    href: "/dashboard/library",
    icon: History,
  },
  {
    title: "Templates",
    href: "/dashboard/templates",
    icon: LayoutTemplate,
  },
]

const MAX_CREDITS = 20

interface AppSidebarProps {
  balance: number
}

export function AppSidebar({ balance }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Logo */}
      <SidebarHeader className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="BuatinAi">
              <Link href="/dashboard">
                <Image src="/logo.svg" alt="BuatinAi Logo" width={32} height={32} className="size-8 rounded-lg" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-base">BuatinAi</span>
                  <span className="text-xs text-muted-foreground">AI generative platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-primary/15 hover:text-primary" : ""}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Credit Balance in Footer */}
      <SidebarFooter className="px-3 pb-4">
        <div className="rounded-xl bg-slate-900 dark:bg-slate-800 p-4 text-white flex flex-col gap-3 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-slate-400">Credits Remaining</p>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold">{balance.toLocaleString()}</p>
            <p className="text-xs text-slate-400">of {MAX_CREDITS.toLocaleString()}</p>
          </div>
          <Progress
            value={(balance / MAX_CREDITS) * 100}
            className="h-1.5 bg-slate-700 [&>div]:bg-primary"
          />
          <Button
            size="sm"
            className="w-full text-white font-semibold"
          >
            Upgrade Credits
          </Button>
        </div>

        {/* Collapsed state — icon only */}
        <SidebarMenu className="group-data-[collapsible=icon]:flex hidden group-data-[collapsible=icon]:block">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={`${balance} Credits`}
              className="h-10 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700"
            >
              <Sparkles className="size-4 text-primary shrink-0" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
