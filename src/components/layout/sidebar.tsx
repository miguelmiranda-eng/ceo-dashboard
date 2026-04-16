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
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-9 h-9 drop-shadow-[0_2px_10px_rgba(14,165,233,0.3)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <mask id="globeMask">
                    <circle cx="50" cy="50" r="46" fill="white" />
                    <path d="M -5,45 C 35,5 75,50 105,25" fill="none" stroke="black" strokeWidth="12" strokeLinecap="round" />
                    <path d="M -5,80 C 45,60 65,95 105,65" fill="none" stroke="black" strokeWidth="12" strokeLinecap="round" />
                  </mask>
                  <linearGradient id="logoBright" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#logoBright)" mask="url(#globeMask)" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[13px] leading-tight tracking-tight text-foreground uppercase">Prosper</span>
              <span className="font-bold text-[8.5px] leading-none tracking-widest text-primary uppercase mt-0.5">Manufacturing</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <mask id="globeMaskCollapsed">
                  <circle cx="50" cy="50" r="46" fill="white" />
                  <path d="M -5,45 C 35,5 75,50 105,25" fill="none" stroke="black" strokeWidth="12" strokeLinecap="round" />
                  <path d="M -5,80 C 45,60 65,95 105,65" fill="none" stroke="black" strokeWidth="12" strokeLinecap="round" />
                </mask>
              </defs>
              <circle cx="50" cy="50" r="46" fill="#0ea5e9" mask="url(#globeMaskCollapsed)" />
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
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
              )}
              <item.icon className={cn(
                "h-5 w-5 min-w-[20px] transition-colors",
                isActive ? "text-primary" : "group-hover:text-primary"
              )} />
              {!collapsed && <span className={cn(
                "text-[11px] font-black uppercase tracking-[0.15em] transition-colors",
                isActive ? "text-foreground" : "group-hover:text-foreground"
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
              <span className="text-[11px] font-bold uppercase tracking-widest">Collapse</span>
            </>
          )}
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 min-w-[20px]" />
          {!collapsed && <span className="text-[11px] font-bold uppercase tracking-widest">{t("logout")}</span>}
        </button>
      </div>
    </aside>
  )
}
