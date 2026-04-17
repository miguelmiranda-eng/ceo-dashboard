"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { fetchDashboardData, DashboardData } from "@/lib/api"
import { TrendChart } from "@/components/widgets/trend-chart"
import { TopMachinesChart } from "@/components/widgets/top-machines-chart"
import { TopClientsCard } from "@/components/widgets/top-clients-card"
import { LoadDistributionChart } from "@/components/widgets/load-distribution-chart"
import { EfficiencyRadialChart } from "@/components/widgets/efficiency-radial-chart"
import { ShiftsDonut } from "@/components/widgets/shifts-donut"
import { useDashboardFilters } from "@/lib/filter-context"
import {
  Loader2,
  RefreshCw,
  Signal,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AnalyticsDashboardPage() {
  const { t } = useI18n()
  const { filters, setExportData } = useDashboardFilters()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchDashboardData(filters)
      setData(result)
      setExportData(result) // Push data to global context for navbar export
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to fetch dashboard data", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Load data whenever global filters change
  useEffect(() => {
    loadData()
  }, [filters])

  // Simple auto-refresh
  useEffect(() => {
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filters])

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground animate-pulse">
            Booting Local & Transborder Intelligence...
          </p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm p-8 border border-destructive/20 bg-destructive/5">
          <div className="h-14 w-14 rounded-none bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Signal className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <p className="font-black text-foreground uppercase tracking-[0.2em] text-lg">Signal Lost</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground mt-2 tracking-widest leading-relaxed">{error}</p>
          </div>
          <Button variant="outline" onClick={loadData} className="rounded-none border-primary text-primary hover:bg-primary hover:text-white uppercase font-black text-[10px] tracking-[0.2em] h-11 px-8">
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-Initialize Protocol
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-full bg-background text-foreground space-y-10 animate-in fade-in duration-1000 selection:bg-primary/30 max-w-[1700px] mx-auto pb-20">

      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-4 mb-1">
             <div className="w-2 h-8 bg-primary rounded-none shadow-[0_0_15px_rgba(30,91,255,0.5)]" />
             <h3 className="text-3xl font-extrabold tracking-tight uppercase text-foreground">{t("dashboard")}</h3>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground opacity-90">
              {t("intelligenceHub")} · {lastUpdated && <>{t("syncEstablished")} {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="rounded-none border-primary bg-background hover:bg-primary hover:text-white text-primary gap-3 h-11 px-6 text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_4px_15px_rgba(30,91,255,0.2)] transition-all active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("forceRefresh")}
          </Button>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Top Feature: Trend Chart */}
        <div className="lg:col-span-4 min-h-[400px]">
          <TrendChart
            data={data.efficiencyTrends}
            title={t("productionTrendTitle")}
            description={t("industrialAnalyticsEngine")}
          />
        </div>

        {/* Middle Stats Row */}
        <div className="lg:col-span-1 min-h-[350px]">
           <EfficiencyRadialChart efficiency={data.efficiency} />
        </div>
        
        <div className="lg:col-span-1 min-h-[350px]">
           <LoadDistributionChart machines={data.machinery.machines} />
        </div>

        <div className="lg:col-span-2 min-h-[350px]">
           <TopMachinesChart data={data.topMachines} />
        </div>

        {/* Bottom Metrics Row */}
        <div className="lg:col-span-2 min-h-[350px]">
          <TopClientsCard 
            data={data.topClients} 
            title={t("topClientsTitle")}
            description={t("clientPortfolioImpact")}
          />
        </div>

        <div className="lg:col-span-2 min-h-[350px]">
           <ShiftsDonut 
             title={t("shiftsTitle")}
             description={t("opShiftBalancer")}
           />
        </div>
        
      </div>
    </div>
  )
}
