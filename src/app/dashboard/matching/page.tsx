"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { useDashboardFilters } from "@/lib/filter-context"
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ArrowUpDown,
  FileText,
  DollarSign,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MatchingOrder {
  order_number: string
  client: string
  mos_status: string
  mos_pieces: number
  printavo_id: number | null
  printavo_total: number
  printavo_status: string
  is_matched: boolean
  printavo_url: string | null
  invoice_url: string | null
  updated_at: string
}

interface MatchingStats {
  total_final_bill: number
  billed_count: number
  unbilled_count: number
  total_value_matched: number
}

import { LoadingOverlay } from "@/components/ui/loading-overlay"

export default function MatchingPage() {
  const { t } = useI18n()
  const { filters: globalFilters } = useDashboardFilters()
  const [data, setData] = useState<{ stats: MatchingStats; orders: MatchingOrder[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<'all' | 'billed' | 'unbilled' | 'final_bill' | 'scheduled' | 'ready_to_bill'>('all')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (globalFilters.preset) params.set('preset', globalFilters.preset)
    if (globalFilters.date_from) params.set('date_from', globalFilters.date_from)
    if (globalFilters.date_to) params.set('date_to', globalFilters.date_to)

    fetch(`/api/matching?${params.toString()}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [globalFilters.preset, globalFilters.date_from, globalFilters.date_to])

  const filteredOrders = data?.orders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                          o.client.toLowerCase().includes(search.toLowerCase())
    let matchesFilter = true;
    if (filter === 'billed') matchesFilter = o.printavo_status === 'Completed';
    if (filter === 'unbilled') matchesFilter = o.printavo_status !== 'Completed';
    if (filter === 'final_bill') matchesFilter = o.printavo_status === 'Final Bill';
    if (filter === 'scheduled') matchesFilter = o.printavo_status === 'Scheduled';
    if (filter === 'ready_to_bill') matchesFilter = (o.mos_status || '').toUpperCase() === 'COMPLETOS';

    return matchesSearch && matchesFilter
  }) || []

  const getFilterTotal = (filterType: string) => {
    if (!data?.orders) return 0;
    const ordersForFilter = data.orders.filter(o => {
      if (filterType === 'all') return true;
      if (filterType === 'billed') return o.printavo_status === 'Completed';
      if (filterType === 'unbilled') return o.printavo_status !== 'Completed';
      if (filterType === 'final_bill') return o.printavo_status === 'Final Bill';
      if (filterType === 'scheduled') return o.printavo_status === 'Scheduled';
      if (filterType === 'ready_to_bill') return (o.mos_status || '').toUpperCase() === 'COMPLETOS';
      return false;
    });
    return ordersForFilter.reduce((sum, o) => sum + (o.printavo_total || 0), 0);
  };

  const formatTotal = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen p-8 space-y-8 animate-in fade-in duration-700" style={{ background: "linear-gradient(135deg, #0B1F3A 0%, #0d2a52 40%, #0f2d5c 100%)" }}>
      <LoadingOverlay isLoading={loading} message={t("exportingReport")} />
      {!loading && (
        <>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight uppercase text-white">
          {t("matching")}
        </h1>
        <p className="text-[#0EA5E9]/80 text-sm font-medium tracking-wide uppercase">
          {t("matchingSubtitle")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-[#1E5BFF]/30 backdrop-blur-xl" style={{ background: "rgba(30, 91, 255, 0.12)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]">
              {t("totalMosOrders")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">{data?.stats.total_final_bill}</span>
                <span className="text-xs font-bold text-[#0EA5E9] mt-1">{formatTotal(getFilterTotal('all'))}</span>
              </div>
              <FileText className="h-8 w-8 text-[#1E5BFF] opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 backdrop-blur-xl" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              {t("billed")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">{data?.stats.billed_count}</span>
                <span className="text-xs font-bold text-emerald-400 mt-1">{formatTotal(data?.stats.total_value_matched || 0)}</span>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-500/30 backdrop-blur-xl" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">
              {t("unbilled")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">{data?.stats.unbilled_count}</span>
                <span className="text-xs font-bold text-rose-400 mt-1">{formatTotal(getFilterTotal('unbilled'))}</span>
              </div>
              <AlertCircle className="h-8 w-8 text-rose-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0EA5E9]/30 backdrop-blur-xl" style={{ background: "rgba(14, 165, 233, 0.12)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]">
              {t("billingTotal")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-white">
                {formatTotal(data?.stats.total_value_matched || 0)}
              </span>
              <DollarSign className="h-8 w-8 text-[#0EA5E9] opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <div className="space-y-4">
        {/* Search Bar Row */}
        <div className="w-full md:w-[400px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0EA5E9]/60" />
            <Input 
              placeholder={t("searchPlaceholder")} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#1E5BFF]/30 focus:border-[#1E5BFF] transition-all uppercase text-xs font-bold tracking-widest text-white placeholder:text-white/30"
              style={{ background: "rgba(30, 91, 255, 0.12)" }}
            />
          </div>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 p-1 rounded-lg border border-[#1E5BFF]/30 w-full" style={{ background: "rgba(30, 91, 255, 0.08)" }}>
            <Button 
              variant={filter === 'all' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('all')}
              className="text-[10px] font-bold uppercase tracking-widest px-4"
            >
              {t("all")} ({formatTotal(getFilterTotal('all'))})
            </Button>
            <Button 
              variant={filter === 'billed' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('billed')}
              className="text-[10px] font-bold uppercase tracking-widest px-4"
            >
              {t("billed")} ({formatTotal(getFilterTotal('billed'))})
            </Button>
            <Button 
              variant={filter === 'unbilled' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('unbilled')}
              className="text-[10px] font-bold uppercase tracking-widest px-4"
            >
              {t("unbilled")} ({formatTotal(getFilterTotal('unbilled'))})
            </Button>
            <Button 
              variant={filter === 'ready_to_bill' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('ready_to_bill')}
              className="text-[10px] font-bold uppercase tracking-widest px-4 text-violet-400"
            >
              {t("readyToBill")} ({formatTotal(getFilterTotal('ready_to_bill'))})
            </Button>
            <Button 
              variant={filter === 'final_bill' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('final_bill')}
              className="text-[10px] font-bold uppercase tracking-widest px-4 text-[#0EA5E9]"
            >
              {t("printavoFinalBill")} ({formatTotal(getFilterTotal('final_bill'))})
            </Button>
            <Button 
              variant={filter === 'scheduled' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('scheduled')}
              className="text-[10px] font-bold uppercase tracking-widest px-4 text-[#0EA5E9]"
            >
              {t("printavoScheduled")} ({formatTotal(getFilterTotal('scheduled'))})
            </Button>
          </div>

        <div className="rounded-xl border border-[#1E5BFF]/20 overflow-hidden" style={{ background: "rgba(11, 31, 58, 0.7)", backdropFilter: "blur(12px)" }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E5BFF]/20" style={{ background: "rgba(30, 91, 255, 0.1)" }}>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Order #</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">MOS Pieces</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Printavo Total</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E5BFF]/10">
              {filteredOrders.map((order, index) => (
                <tr key={`${order.order_number}-${index}`} className="transition-colors group" style={{ background: "transparent" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(30, 91, 255, 0.06)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-white tracking-tight">#{order.order_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wide">{order.client}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{order.mos_status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-bold text-white/70">{order.mos_pieces}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-sm font-black tracking-tight",
                      order.is_matched ? "text-emerald-400" : "text-muted-foreground"
                    )}>
                      ${order.printavo_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex items-center justify-end gap-3">
                        {order.printavo_status === 'Completed' ? (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{t("billed")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20">
                            <AlertCircle className="h-3 w-3 text-rose-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">{t("unbilled")}</span>
                          </div>
                        )}
                        
                        {order.printavo_url && (
                          <a 
                            href={order.printavo_url} 
                            target="_blank" 
                            rel="noreferrer"
                            title="Ver Work Order"
                            className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-primary transition-all"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        {order.invoice_url && (
                          <a 
                            href={order.invoice_url} 
                            target="_blank" 
                            rel="noreferrer"
                            title="Ver Invoice"
                            className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-emerald-500 transition-all"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {order.printavo_status !== 'Completed' && order.printavo_status !== 'Not Found' && (
                        <span className="text-[8px] font-bold text-[#0EA5E9] uppercase tracking-widest">
                          (EN PRINTAVO: {order.printavo_status})
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]">
                      No se encontraron órdenes para conciliar
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
