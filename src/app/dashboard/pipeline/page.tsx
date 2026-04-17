"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { PipelineChart } from "@/components/widgets/pipeline-chart"
import { PipelineOrders } from "@/components/widgets/pipeline-orders"
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  Package,
  Globe2
} from "lucide-react"

export default function PipelinePage() {
  const { t } = useI18n()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch("/api/printavo")
      if (!res.ok) {
        throw new Error("Failed to load pipeline data")
      }
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auto refresh every 5 mins
    const interval = setInterval(loadData, 300000)
    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 font-bold uppercase tracking-widest text-xs mb-4">Connection Failed</p>
        <button onClick={loadData} className="px-6 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-widest">
          Retry
        </button>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-[#0B1F3A] dark:text-white uppercase mb-1">
            Pipeline Central
          </h1>
          <p className="text-xs font-bold tracking-widest text-[#0B1F3A]/60 dark:text-slate-400 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live from Printavo
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span>{lastUpdated ? lastUpdated.toLocaleTimeString() : ""}</span>
          <button 
            onClick={loadData}
            disabled={loading}
            className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Value Cards using the Master Brand Scheme */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0B1F3A] rounded-2xl p-6 relative overflow-hidden shadow-xl border border-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <TrendingUp className="w-24 h-24 text-blue-400" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Projected Revenue</p>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-1">
            $<span className="opacity-90">{data?.revenue?.toLocaleString('en-US') || "0"}</span>
          </h2>
          <p className="text-[10px] font-bold text-[#F5F7FA]/50 uppercase tracking-widest">
            Across {data?.orders?.length || 0} Open Orders
          </p>
        </div>

        <div className="bg-[#0B1F3A] rounded-2xl p-6 relative overflow-hidden shadow-xl border border-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Package className="w-24 h-24 text-emerald-400" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Production Volume</p>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-1">
            {data?.volume?.toLocaleString() || "0"}
          </h2>
          <p className="text-[10px] font-bold text-[#F5F7FA]/50 uppercase tracking-widest">
            Pieces in queue
          </p>
        </div>

        <div className="bg-[#0B1F3A] rounded-2xl p-6 relative overflow-hidden shadow-xl border border-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Globe2 className="w-24 h-24 text-blue-400" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Cross-Border Est.</p>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-1">
            {data?.delivery_days || 0} <span className="text-lg opacity-70">Days</span>
          </h2>
          <p className="text-[10px] font-bold text-[#F5F7FA]/50 uppercase tracking-widest">
            Production + Transit (MX→US)
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#0B1F3A] dark:text-white">Active Pipeline</h3>
              <span className="text-[10px] font-bold bg-[#0B1F3A]/5 dark:bg-slate-800 text-[#0B1F3A] dark:text-slate-300 px-3 py-1 rounded-full uppercase tracking-widest">
                {data?.orders?.length || 0} Orders
              </span>
            </div>
            <PipelineOrders orders={data?.orders || []} />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-28">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#0B1F3A] dark:text-white mb-6">Revenue Trajectory</h3>
            <PipelineChart data={data?.timeline || []} />
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Currently Running</span>
                <span className="text-sm font-black text-emerald-500">
                  ${data?.matched_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || "0.00"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Amount strictly corresponding to machines active in MOS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
