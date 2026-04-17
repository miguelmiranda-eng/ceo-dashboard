"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { 
  FileSpreadsheet, 
  FileText, 
  Calendar as CalendarIcon,
  Loader2,
  Check
} from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { cn } from "@/lib/utils"
import { DashboardData, DashboardFilters } from "@/lib/api"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

type Preset = "today" | "yesterday" | "week" | "month"

interface ReportToolbarProps {
  onFilterChange: (filters: DashboardFilters) => void
  data: DashboardData | null
  compact?: boolean
}

export function ReportToolbar({ onFilterChange, data, compact }: ReportToolbarProps) {
  const { t } = useI18n()
  const [selectedPreset, setSelectedPreset] = useState<Preset>("week")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [exporting, setExporting] = useState<string | null>(null)

  // Sync calendar with text input
  const getSelectedDate = (val: string) => {
    const d = parse(val, "yyyy-MM-dd", new Date())
    return isValid(d) ? d : undefined
  }

  // Handle preset change
  const handlePresetSelect = (p: Preset) => {
    setSelectedPreset(p)
    setDateFrom("")
    setDateTo("")
    onFilterChange({ preset: p })
  }

  // Handle custom date apply
  const handleApplyCustomRange = () => {
    if (dateFrom && dateTo) {
      const d1 = getSelectedDate(dateFrom)
      const d2 = getSelectedDate(dateTo)
      if (d1 && d2) {
        onFilterChange({ date_from: dateFrom, date_to: dateTo })
      }
    }
  }

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (!data) return
    setExporting(type)
    
    try {
      if (type === 'excel') {
        const params = new URLSearchParams()
        if (selectedPreset) params.append('preset', selectedPreset)
        if (dateFrom) params.append('date_from', dateFrom)
        if (dateTo) params.append('date_to', dateTo)
        
        const url = `/api/descargar/Reporte_Produccion_MOS.xlsx?${params.toString()}`
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'Reporte_Produccion_MOS.xlsx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        await new Promise(r => setTimeout(r, 2000))
      } else {
        await new Promise(r => setTimeout(r, 800))
        window.print()
      }
    } catch (err) {
      console.error("Export failed", err)
    } finally {
      setExporting(null)
    }
  }

  const content = (
    <div className={cn(
      "bg-card/80 backdrop-blur-xl border border-border p-1 rounded-full flex items-center shadow-lg ring-1 ring-border flex-wrap justify-center sm:flex-nowrap transition-all duration-300",
      compact ? "p-0.5" : "p-1.5"
    )}>
      
      {/* Presets Segment */}
      <div className="flex items-center gap-1 px-1">
        {(["today", "yesterday", "week", "month"] as Preset[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePresetSelect(p)}
            className={cn(
              "rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group whitespace-nowrap",
              compact ? "px-3 py-1.5" : "px-5 py-2",
              selectedPreset === p && !dateFrom
                ? "bg-primary text-primary-foreground shadow-md z-10" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span className="relative z-10">{t(p)}</span>
            {selectedPreset === p && !dateFrom && (
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/20 to-primary/20 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-[1px] h-6 bg-border mx-2 hidden sm:block" />

      {/* Date Range Segment */}
      <div className={cn("flex items-center gap-2 py-1", compact ? "px-1 sm:px-2" : "px-4")}>
        
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-2 group cursor-pointer hover:bg-accent px-2 py-1 rounded-lg transition-colors">
              <CalendarIcon className="h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="YYYY-MM-DD" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "bg-transparent border-none p-0 text-[10px] font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 pointer-events-auto",
                  compact ? "w-16 sm:w-20" : "w-24"
                )}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border border-border shadow-2xl rounded-3xl overflow-hidden bg-card" align="start">
            <Calendar
              mode="single"
              selected={getSelectedDate(dateFrom)}
              onSelect={(d) => d && setDateFrom(format(d, "yyyy-MM-dd"))}
              initialFocus
              className="bg-card text-foreground"
            />
          </PopoverContent>
        </Popover>
        
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{t("to")}</span>
        
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-2 group cursor-pointer hover:bg-accent px-2 py-1 rounded-lg transition-colors">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="YYYY-MM-DD" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "bg-transparent border-none p-0 text-[11px] font-bold text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30 pointer-events-auto",
                  compact ? "w-20" : "w-24"
                )}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border border-border shadow-2xl rounded-3xl overflow-hidden bg-card" align="start">
            <Calendar
              mode="single"
              selected={getSelectedDate(dateTo)}
              onSelect={(d) => d && setDateTo(format(d, "yyyy-MM-dd"))}
              initialFocus
              className="bg-card text-foreground"
            />
          </PopoverContent>
        </Popover>

        <button 
          onClick={handleApplyCustomRange}
          disabled={!dateFrom || !dateTo}
          className="ml-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all disabled:opacity-0"
        >
          <Check className="h-3 w-3" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-[1px] h-6 bg-border mx-2 hidden sm:block" />

      {/* Export Actions */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={() => handleExport('excel')}
          className={cn(
            "flex items-center gap-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all duration-300 group active:scale-95 disabled:opacity-50",
            compact ? "px-3 py-1.5" : "px-4 py-2"
          )}
          disabled={!!exporting || !data}
        >
          {exporting === 'excel' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">{t("excel")}</span>
        </button>

        <button
          onClick={() => handleExport('pdf')}
          className={cn(
            "flex items-center gap-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-300 group active:scale-95 disabled:opacity-50",
            compact ? "px-3 py-1.5" : "px-4 py-2"
          )}
          disabled={!!exporting || !data}
        >
          {exporting === 'pdf' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">{t("pdf")}</span>
        </button>
      </div>
    </div>
  )

  if (compact) return content

  return (
    <div className="w-full flex justify-center py-4 print:hidden">
      {content}
    </div>
  )
}
