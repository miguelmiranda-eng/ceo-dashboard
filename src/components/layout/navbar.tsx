"use client"

import { useTheme } from "next-themes"
import { useI18n } from "@/lib/i18n"
import { Sun, Moon, Languages } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NotificationCenter } from "./notification-center"
import { ReportToolbar } from "@/components/widgets/report-toolbar"
import { useDashboardFilters } from "@/lib/filter-context"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const { setLanguage, language, t } = useI18n()
  const { setFilters, exportData } = useDashboardFilters()
  const pathname = usePathname()

  const isAnalyticsPage = pathname === "/dashboard"

  return (
    <header className="h-20 bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-10 px-4 lg:px-6 flex items-center justify-between gap-4 xl:gap-6">
      <div className="flex items-center gap-4 xl:gap-6 flex-1 min-w-0">
        {/* Status Indicator */}
        <div className="flex flex-col shrink-0">
          <h1 className="text-xs font-semibold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {t("connected")}
          </h1>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em] leading-tight mt-1">PROSPER INTEL v4.0</p>
        </div>

        {/* Global Toolbar Integration - Hidden in Invoices */}
        {!pathname.includes("/dashboard/invoices") && (
          <div className="hidden xl:flex flex-1 justify-center min-w-0">
            <ReportToolbar 
              onFilterChange={setFilters} 
              data={exportData}
              compact={true}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Icons moved to sidebar */}
      </div>
    </header>
  )
}
