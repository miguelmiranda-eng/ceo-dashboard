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
  Tags,
  Users,
  Receipt,
  FileText,
  FileCheck2,
  type LucideIcon
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon, Languages, Globe } from "lucide-react"
import { Switch } from "@/components/ui/switch"
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
  const [invoicesExpanded, setInvoicesExpanded] = useState(false)

  const { setTheme, theme } = useTheme()
  const { setLanguage, language } = useI18n()

  const handleLogout = () => {
    document.cookie = "ceo_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    window.location.href = "/login"
  }

  // "Facturas y Cotizaciones" is now an expandable folder with three submodules.
  const navTop = [
    { title: t("matching"), icon: Globe2, href: "/dashboard" },
  ]
  const invoiceSubItems = [
    { title: language === "es" ? "Módulo de Facturas" : "Invoices", icon: Receipt, href: "/dashboard/invoices" },
    { title: language === "es" ? "Módulo de Cotizaciones" : "Quotes", icon: FileText, href: "/dashboard/invoices/quotes" },
    { title: language === "es" ? "Módulo de Cierre" : "Closing", icon: FileCheck2, href: "/dashboard/invoices/closing" },
  ]
  const navRest = [
    { title: language === "es" ? "Clientes" : "Clients", icon: Users, href: "/dashboard/clients" },
    { title: t("workOrders"), icon: Package, href: "/dashboard/work-orders" },
  ]

  const renderNavLink = (item: { title: string; icon: LucideIcon; href: string }) => {
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all duration-300 group relative overflow-hidden",
          isActive
            ? "bg-gradient-to-br from-[#0091D5] to-[#006A9C] text-white shadow-[0_8px_30px_-4px_rgba(0,145,213,0.5)] border border-white/10 scale-[1.02]"
            : "text-slate-400 hover:text-white hover:bg-white/5 hover:scale-[1.01]"
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-0 w-1.5 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
        )}
        {isActive && (
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        )}
        <item.icon className={cn(
          "h-5 w-5 min-w-[20px] transition-transform duration-300",
          isActive ? "text-white scale-110" : "group-hover:text-[#0091D5] group-hover:scale-110"
        )} />
        {!collapsed && <span className={cn(
          "text-[11px] font-black uppercase tracking-[0.15em] transition-colors",
          isActive ? "text-white" : "group-hover:text-white"
        )}>{item.title}</span>}
      </Link>
    )
  }

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
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-[#0091D5]">
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
               <span className="font-black text-[20px] leading-tight tracking-[-0.03em] text-white uppercase italic">Mos</span>
               <span className="font-black text-[10px] leading-none tracking-[0.3em] text-[#0091D5] uppercase mt-1">Atlas</span>
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

      <nav className="flex-1 px-4 space-y-3 mt-8">
        {navTop.map(renderNavLink)}

        {/* Facturas y Cotizaciones Folder */}
        <div className="space-y-2">
          <button
            onClick={() => {
              if (collapsed) { setCollapsed(false); setInvoicesExpanded(true) }
              else { setInvoicesExpanded(!invoicesExpanded) }
            }}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all duration-300 group relative overflow-hidden",
              (invoicesExpanded && !collapsed)
                ? "bg-white/5 text-white border border-white/5"
                : "text-slate-400 hover:text-white hover:bg-white/5 hover:scale-[1.01]"
            )}
          >
            <BarChart3 className={cn(
              "h-5 w-5 min-w-[20px] transition-transform duration-300",
              (invoicesExpanded && !collapsed) ? "text-[#0091D5] scale-110" : "group-hover:text-[#0091D5] group-hover:scale-110"
            )} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-[11px] font-black uppercase tracking-[0.15em]">{t("invoices")}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-300 text-slate-500",
                  invoicesExpanded ? "rotate-180 text-white" : "group-hover:text-white"
                )} />
              </>
            )}
          </button>

          {invoicesExpanded && !collapsed && (
            <div className="ml-6 pl-4 border-l-2 border-[#0091D5]/20 space-y-2 animate-in slide-in-from-top-2 duration-300">
              {invoiceSubItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                      isActive
                        ? "bg-[#0091D5]/10 text-[#0091D5] font-black shadow-inner border border-[#0091D5]/20"
                        : "text-slate-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 min-w-[16px] transition-all duration-300",
                      isActive ? "text-[#0091D5] scale-110" : "group-hover:text-[#0091D5] group-hover:scale-110"
                    )} />
                    <span className={cn(
                      "text-[10px] uppercase tracking-[0.15em] transition-colors",
                      isActive ? "text-[#0091D5] font-black" : "font-bold group-hover:text-white"
                    )}>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {navRest.map(renderNavLink)}

        {/* Tools Folder */}
        <div className="space-y-2 pt-4">
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
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all duration-300 group relative overflow-hidden",
              (toolsExpanded && !collapsed) 
                ? "bg-white/5 text-white border border-white/5" 
                : "text-slate-400 hover:text-white hover:bg-white/5 hover:scale-[1.01]"
            )}
          >
            <Wrench className={cn(
              "h-5 w-5 min-w-[20px] transition-transform duration-300",
              (toolsExpanded && !collapsed) ? "text-[#0091D5] scale-110" : "group-hover:text-[#0091D5] group-hover:scale-110"
            )} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-[11px] font-black uppercase tracking-[0.15em]">Herramientas</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-300 text-slate-500",
                  toolsExpanded ? "rotate-180 text-white" : "group-hover:text-white"
                )} />
              </>
            )}
          </button>

          {toolsExpanded && !collapsed && (
            <div className="ml-6 pl-4 border-l-2 border-[#0091D5]/20 space-y-2 animate-in slide-in-from-top-2 duration-300">
              {toolItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
                      isActive 
                        ? "bg-[#0091D5]/10 text-[#0091D5] font-black shadow-inner border border-[#0091D5]/20" 
                        : "text-slate-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 min-w-[16px] transition-all duration-300",
                      isActive ? "text-[#0091D5] scale-110" : "group-hover:text-[#0091D5] group-hover:scale-110"
                    )} />
                    <span className={cn(
                      "text-[10px] uppercase tracking-[0.15em] transition-colors",
                      isActive ? "text-[#0091D5] font-black" : "font-bold group-hover:text-white"
                    )}>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className={cn("flex items-center justify-between gap-2 p-2", collapsed && "flex-col")}>
          <div className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-white/5 transition-all">
            <span className="text-[8px] font-bold text-slate-500 tracking-tighter">ES / EN</span>
            <Switch 
              checked={language === "en"} 
              onCheckedChange={(checked) => setLanguage(checked ? "en" : "es")}
              size="sm"
              className="data-checked:bg-[#0091D5]"
            />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <NotificationCenter />

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="h-10 w-10 rounded-xl hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 transition-all"
          >
            <LogOut className="h-5 w-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
