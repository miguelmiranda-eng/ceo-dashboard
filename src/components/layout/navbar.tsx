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
    <header className="h-20 bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-10 px-6 lg:px-8 flex items-center justify-between gap-8">
      <div className="flex items-center gap-8 flex-1 min-w-0">
        {/* Status Indicator */}
        <div className="flex flex-col shrink-0">
          <h1 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {t("connected")}
          </h1>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">PROSPER v3.4</p>
        </div>

        {/* Global Toolbar - Visible only on non-analytics pages */}
        {!isAnalyticsPage && (
          <div className="hidden md:block">
            <ReportToolbar 
              onFilterChange={setFilters} 
              data={exportData}
              compact={true}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground">
              <Languages className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl bg-card border border-border text-foreground">
            <DropdownMenuItem onClick={() => setLanguage("en")} className={cn(language === "en" ? "bg-accent" : "", "cursor-pointer font-bold uppercase text-[10px] tracking-widest")}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("es")} className={cn(language === "es" ? "bg-accent" : "", "cursor-pointer font-bold uppercase text-[10px] tracking-widest")}>
              Español
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <NotificationCenter />

        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-blue-700 flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(14,165,233,0.3)] tracking-tighter">
          CEO
        </div>
      </div>
    </header>
  )
}
