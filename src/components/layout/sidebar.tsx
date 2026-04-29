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
  ChevronDown,
  Package,
  Globe2,
  Workflow,
  Wrench,
  Tags
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon, Languages } from "lucide-react"
import { NotificationCenter } from "./notification-center"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export function Sidebar() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [toolsExpanded, setToolsExpanded] = useState(false)

  const { setTheme, theme } = useTheme()
  const { setLanguage, language } = useI18n()

  const handleLogout = () => {
    document.cookie = "ceo_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    window.location.href = "/login"
  }

  const navItems = [
    { title: t("invoices"), icon: BarChart3, href: "/dashboard/invoices" },
    { title: t("workOrders"), icon: Package, href: "/dashboard/work-orders" },
    { title: t("matching"), icon: Globe2, href: "/dashboard/matching" },
  ]

  const toolItems = [
    { title: t("automations"), icon: Workflow, href: "/dashboard/automations" },
    { title: "Administrar Etiquetas", icon: Tags, href: "/dashboard/status-labels" },
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

        {/* Tools Folder */}
        <div className="space-y-1">
          <button
            onClick={() => {
              if (collapsed) {
                setCollapsed(false)
                setToolsExpanded(true)
              } else {
                setToolsExpanded(!toolsExpanded)
              }
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group",
              (toolsExpanded && !collapsed) ? "bg-sidebar-accent/50 text-white" : "text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent"
            )}
          >
            <Wrench className={cn(
              "h-5 w-5 min-w-[20px] transition-colors",
              (toolsExpanded && !collapsed) ? "text-primary" : "group-hover:text-primary"
            )} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-xs font-bold uppercase tracking-[0.15em]">Herramientas</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  toolsExpanded ? "rotate-180" : ""
                )} />
              </>
            )}
          </button>

          {toolsExpanded && !collapsed && (
            <div className="ml-4 pl-4 border-l border-sidebar-border space-y-1 animate-in slide-in-from-top-2 duration-200">
              {toolItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
                      isActive 
                        ? "text-primary" 
                        : "text-sidebar-foreground/40 hover:text-white"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 min-w-[16px] transition-colors",
                      isActive ? "text-primary" : "group-hover:text-primary"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.1em] transition-colors",
                      isActive ? "text-primary" : "group-hover:text-white"
                    )}>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center justify-between gap-2 p-2", collapsed && "flex-col")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white/10 text-sidebar-foreground/60 hover:text-white transition-all">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="rounded-md bg-sidebar border border-sidebar-border text-white">
              <DropdownMenuItem onClick={() => setLanguage("en")} className={cn(language === "en" ? "bg-primary" : "", "cursor-pointer font-bold uppercase text-[9px] tracking-widest")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("es")} className={cn(language === "es" ? "bg-primary" : "", "cursor-pointer font-bold uppercase text-[9px] tracking-widest")}>
                Español
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-md hover:bg-white/10 text-sidebar-foreground/60 hover:text-white transition-all"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <NotificationCenter />

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="h-8 w-8 rounded-md hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-md hover:bg-white/10 text-sidebar-foreground/60 hover:text-white transition-all"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
