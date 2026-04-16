"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { fetchDashboardData, DashboardData } from "@/lib/api"
import {
  Cpu,
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Timer,
  Package,
  TrendingUp,
  Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function MachineryPage() {
  const { t } = useI18n()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchDashboardData()
      setData(result)
    } catch (err) {
      console.error("Failed to fetch machinery data", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredMachines = data?.machinery.machines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Scanning Industrial Grid...
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
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-black text-foreground uppercase tracking-tight">Telemetry Failure</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground mt-1">{error}</p>
          </div>
          <Button variant="ghost" onClick={loadData} className="gap-2 text-primary hover:bg-primary/10 uppercase font-black text-[10px] tracking-widest">
            <RefreshCw className="h-4 w-4" />
            Retry Link
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'red': return 'text-rose-500'
      case 'yellow': return 'text-amber-500'
      case 'green': return 'text-emerald-500'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusBg = (status?: string) => {
    switch (status) {
      case 'red': return 'bg-rose-500/10 border-rose-500/20'
      case 'yellow': return 'bg-amber-500/10 border-amber-500/20'
      case 'green': return 'bg-emerald-500/10 border-emerald-500/20'
      default: return 'bg-muted border-border'
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground p-6 md:p-10 space-y-10 animate-in fade-in duration-1000 selection:bg-primary/30">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-2 h-6 bg-primary rounded-full" />
             <h3 className="text-2xl font-black tracking-tighter uppercase text-foreground">{t("machines")}</h3>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-5 opacity-80">
            {t("plantResourceView")} · {filteredMachines.length} Active Nodes
          </p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="SEARCH NODES..." 
            className="pl-11 rounded-full bg-card border-border focus:border-primary/50 hover:bg-accent transition-all h-11 text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-sm relative group hover:border-primary/20 transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {t("activeMachines")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black tracking-tighter text-foreground">{data.machinery.active}</p>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nodes Engaged</span>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/70 mt-2 uppercase tracking-tight">Critical processing flow optimal</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-sm relative group hover:border-primary/20 transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              {t("inactiveMachines")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black tracking-tighter text-foreground">{data.machinery.inactive}</p>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nodes Idle</span>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/70 mt-2 uppercase tracking-tight">Maintenance or buffer state</p>
          </CardContent>
        </Card>
      </div>

      {/* Nodes Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMachines.map((machine) => (
          <Card key={machine.id} className="rounded-2xl border-border bg-card overflow-hidden shadow-sm group hover:border-primary/20 transition-all duration-500 hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-black tracking-widest uppercase text-foreground">{machine.name}</CardTitle>
                  <CardDescription className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Node ID: {machine.id}</CardDescription>
                </div>
                <div className={cn("px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm", getStatusBg(machine.loadStatus), getStatusColor(machine.loadStatus))}>
                  {machine.loadStatus || "Standby"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pb-8">
              {/* Load Capacity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{t("capacity")}</span>
                   </div>
                   <span className="text-xs font-black text-primary">{machine.capacity}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-blue-600 to-primary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(14,165,233,0.3)]" 
                     style={{ width: `${machine.capacity}%` }}
                   />
                </div>
              </div>

              {/* Active Orders Section */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5 opacity-60 mb-3 text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{t("activeOrders")}</span>
                </div>
                {machine.activeOrders && machine.activeOrders.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {machine.activeOrders.map((order, idx) => (
                      <div 
                        key={`${machine.id}-order-${idx}`}
                        className="px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/20 text-[11px] font-black text-primary tracking-tight shadow-sm hover:bg-primary/10 transition-colors flex items-center gap-1.5"
                      >
                         <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                         #{order}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-muted-foreground italic opacity-40">{t("noActiveOrders")}</p>
                )}
              </div>

              {/* Data Matrix */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-1">
                   <div className="flex items-center gap-1.5 opacity-60 text-muted-foreground">
                     <Timer className="h-3 w-3" />
                     <span className="text-[9px] font-bold uppercase tracking-widest">{t("estimatedCompletion")}</span>
                   </div>
                   <p className="text-sm font-black tracking-tight text-foreground">{machine.estimatedDays} {t("daily")}</p>
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-1.5 opacity-60 text-muted-foreground">
                     <Package className="h-3 w-3" />
                     <span className="text-[9px] font-bold uppercase tracking-widest">{t("remainingPieces")}</span>
                   </div>
                   <p className="text-sm font-black tracking-tight text-foreground">{machine.remainingPieces?.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-2">
                 <div className="flex items-center gap-1.5 opacity-60 mb-1 text-muted-foreground">
                   <TrendingUp className="h-3 w-3" />
                   <span className="text-[9px] font-bold uppercase tracking-widest">{t("avgDaily")}</span>
                 </div>
                 <p className="text-xs font-black text-muted-foreground tracking-wider">
                   {machine.avgDaily?.toLocaleString()} <span className="text-[9px] opacity-60 font-medium">UNITS / DAY</span>
                 </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
