"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Settings, 
  BarChart3, 
  Cpu, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  Globe2
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    document.cookie = "ceo_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    window.location.href = "/login"
  }

  const navItems = [
    { title: t("production"), icon: BarChart3, href: "/dashboard/production" },
    { title: t("pipeline"), icon: Package, href: "/dashboard/pipeline" },
    { title: t("matching"), icon: Globe2, href: "/dashboard/matching" },
    { title: t("dashboard"), icon: LayoutDashboard, href: "/dashboard" },
    { title: t("machines"), icon: Cpu, href: "/dashboard/machinery" },
  ]

  return (
    <aside className={cn(
      "h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-20",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-[#0EA5E9]">
              <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="globe-mask">
                  <circle cx="50" cy="50" r="45" fill="white" />
                  <path d="M -10 30 Q 40 5 110 35" stroke="black" strokeWidth="9" fill="none" strokeLinecap="round" />
                  <path d="M -10 55 Q 45 30 110 60" stroke="black" strokeWidth="9" fill="none" strokeLinecap="round" />
                  <path d="M -10 80 Q 50 55 110 85" stroke="black" strokeWidth="9" fill="none" strokeLinecap="round" />
                </mask>
                <circle cx="50" cy="50" r="45" fill="currentColor" mask="url(#globe-mask)" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[20px] leading-tight tracking-[-0.02em] text-white uppercase">Prosper</span>
              <span className="font-semibold text-[11px] leading-none tracking-[0.15em] text-[#0EA5E9] uppercase mt-0.5">Manufacturing</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto flex items-center justify-center text-[#0EA5E9]">
            <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="globe-mask-collapsed">
                <circle cx="50" cy="50" r="45" fill="white" />
                <path d="M -10 30 Q 40 5 110 35" stroke="black" strokeWidth="9" fill="none" strokeLinecap="round" />
                <path d="M -10 55 Q 45 30 110 60" stroke="black" strokeWidth="9" fill="none" strokeLinecap="round" />
                <path d="M -10 80 Q 50 55 110 85" stroke="black" strokeWidth="9" fill="none" strokeLinecap="round" />
              </mask>
              <circle cx="50" cy="50" r="45" fill="currentColor" mask="url(#globe-mask-collapsed)" />
            </svg>
          </div>
        )}

      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(30,91,255,0.4)]" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 min-w-[20px] transition-colors",
                isActive ? "text-white" : "group-hover:text-primary"
              )} />
              {!collapsed && <span className={cn(
                "text-xs font-bold uppercase tracking-[0.15em] transition-colors",
                isActive ? "text-white" : "group-hover:text-white"
              )}>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 mb-2"
        >
          {collapsed ? <ChevronRight className="h-5 w-5 mx-auto" strokeWidth={2.5} /> : (
            <>
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
              <span className="text-xs font-semibold uppercase tracking-widest">Collapse</span>
            </>
          )}
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 min-w-[20px]" />
          {!collapsed && <span className="text-xs font-semibold uppercase tracking-widest">{t("logout")}</span>}
        </button>
      </div>
    </aside>
  )
}
