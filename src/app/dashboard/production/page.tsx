"use client"

import { useEffect, useState } from "react"
import { fetchDashboardData, DashboardData } from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { MetricCard } from "@/components/widgets/metric-card"
import { TrendChart } from "@/components/widgets/trend-chart"
import { MachineLoadBars } from "@/components/widgets/machine-load-bars"
import { Button } from "@/components/ui/button"
import { useDashboardFilters } from "@/lib/filter-context"
import { Loader2, RefreshCw, Layers, TrendingUp, Timer, AlertCircle } from "lucide-react"

export default function ExecutiveInsightsPage() {
  const { t } = useI18n()
  const { filters, setExportData } = useDashboardFilters()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchDashboardData(filters)
      setData(result)
      setExportData(result) // Push data to global context for navbar export
    } catch (err) {
      console.error("Failed to fetch production data", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Load data whenever global filters change
  useEffect(() => {
    loadData()
  }, [filters])

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            SYNCHRONIZING MOS ANALYTICS...
          </p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-rose-500 opacity-50" />
          <p className="font-bold text-primary uppercase tracking-widest text-xl">System Link Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => loadData()} className="gap-2 mt-4 bg-transparent border-primary/50 text-primary hover:bg-primary/10 uppercase font-bold tracking-widest text-xs">
            <RefreshCw className="h-4 w-4" />
            RETRY CONNECTION
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Determine which production data to display based on the active filter
  let activeProducedValue = data.production.weekly.value;
  let activeRemainingValue = data.production.weekly.remaining;

  if (filters.preset === 'today') {
    activeProducedValue = data.production.daily.value;
    activeRemainingValue = data.production.daily.remaining;
  } else if (filters.preset === 'month') {
    activeProducedValue = data.production.monthly.value;
    activeRemainingValue = data.production.monthly.remaining;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
      {/* KPI Row (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t("piecesProduced")}
          value={activeProducedValue.toLocaleString()}
          icon={Layers}
          iconColor="emerald"
          topRightBadge={t("liveRecords")}
        />
        <MetricCard
          title={t("globalEfficiency")}
          value={`${data.efficiency}%`}
          icon={TrendingUp}
          iconColor="sky"
          topRightBadge={t("vsGoal")}
        />
        <MetricCard
          title={t("averageSetup")}
          value={`${data.avgSetup.toFixed(1)} min`}
          icon={Timer}
          iconColor="orange"
          topRightBadge={t("perLabor")}
        />
        <MetricCard
          title={t("estRemaining")}
          value={(activeRemainingValue ?? data.totalRemainingPieces).toLocaleString()}
          icon={AlertCircle}
          iconColor="red"
          topRightBadge={t("toComplete")}
        />
      </div>

      {/* Middle Row: Trend & Machine Load */}
      <div className="grid grid-cols-1 gap-8 items-stretch">
        <div className="min-h-[420px]">
          <TrendChart 
            data={data.efficiencyTrends} 
            title={t("productionTrendTitle")} 
            description={t("industrialAnalyticsEngine")}
          />
        </div>
        <div className="min-h-[420px]">
           <MachineLoadBars 
             data={data.machinery.machines} 
             title={t("machineLoadTitle")}
             description={t("plantResourceView")}
           />
        </div>
      </div>
      
    </div>
  )
}
