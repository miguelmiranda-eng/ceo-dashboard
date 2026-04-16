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
      <div className="flex h-[60vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            INITIALIZING ANALYTICS ENGINE...
          </p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Signal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-black text-foreground uppercase tracking-tight">System Outage</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground mt-1">{error}</p>
          </div>
          <Button variant="ghost" onClick={loadData} className="gap-2 text-primary hover:bg-primary/10 uppercase font-black text-[10px] tracking-widest">
            <RefreshCw className="h-4 w-4" />
            Reconnect
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
          <div className="flex items-center gap-3 mb-1">
             <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
             <h3 className="text-2xl font-black tracking-tighter uppercase text-foreground">{t("dashboard")}</h3>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-80">
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
            className="rounded-xl border-border bg-card hover:bg-accent text-foreground gap-2 h-9 px-4 text-[10px] font-black uppercase tracking-[0.15em] shadow-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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
