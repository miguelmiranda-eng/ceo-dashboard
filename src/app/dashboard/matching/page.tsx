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
    <div className="space-y-8 animate-in fade-in duration-500 p-1">
      <LoadingOverlay isLoading={loading} message={t("exportingReport")} />
      {!loading && (
        <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-12 bg-[#0091D5] rounded-full shadow-[0_0_20px_rgba(0,145,213,0.4)]" />
             <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase italic leading-none">
                {t("matching")}
             </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 opacity-70">
            Prosper Manufacturing &bull; Financial Reconciliation
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-0">
             <div className="flex items-center">
                <div className="w-2 h-24 bg-[#0091D5] shadow-[0_0_20px_rgba(0,145,213,0.2)]" />
                <div className="p-6 flex items-center gap-5 w-full">
                   <div className="w-12 h-12 bg-blue-50 rounded-[1rem] flex items-center justify-center text-[#0091D5] group-hover:scale-110 transition-transform shadow-inner">
                      <FileText className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("totalMosOrders")}</p>
                      <div className="flex items-end gap-2">
                         <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{data?.stats.total_final_bill}</p>
                         <p className="text-xs font-bold text-[#0091D5] mb-1">{formatTotal(getFilterTotal('all'))}</p>
                      </div>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-0">
             <div className="flex items-center">
                <div className="w-2 h-24 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
                <div className="p-6 flex items-center gap-5 w-full">
                   <div className="w-12 h-12 bg-emerald-50 rounded-[1rem] flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner">
                      <CheckCircle2 className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("billed")}</p>
                      <div className="flex items-end gap-2">
                         <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{data?.stats.billed_count}</p>
                         <p className="text-xs font-bold text-emerald-500 mb-1">{formatTotal(data?.stats.total_value_matched || 0)}</p>
                      </div>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-0">
             <div className="flex items-center">
                <div className="w-2 h-24 bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]" />
                <div className="p-6 flex items-center gap-5 w-full">
                   <div className="w-12 h-12 bg-rose-50 rounded-[1rem] flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform shadow-inner">
                      <AlertCircle className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("unbilled")}</p>
                      <div className="flex items-end gap-2">
                         <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{data?.stats.unbilled_count}</p>
                         <p className="text-xs font-bold text-rose-500 mb-1">{formatTotal(getFilterTotal('unbilled'))}</p>
                      </div>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-0">
             <div className="flex items-center">
                <div className="w-2 h-24 bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.2)]" />
                <div className="p-6 flex items-center gap-5 w-full">
                   <div className="w-12 h-12 bg-violet-50 rounded-[1rem] flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform shadow-inner">
                      <DollarSign className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("billingTotal")}</p>
                      <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{formatTotal(data?.stats.total_value_matched || 0)}</p>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder={t("searchPlaceholder")} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-14 bg-white border-slate-200 text-slate-900 h-14 rounded-2xl focus:ring-2 focus:ring-[#0091D5]/20 transition-all border-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 p-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Button 
              variant="ghost" 
              onClick={() => setFilter('all')}
              className={cn("h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", filter === 'all' ? "bg-slate-100 text-[#0F172A] shadow-inner" : "text-slate-400")}
            >
              {t("all")} ({formatTotal(getFilterTotal('all'))})
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setFilter('billed')}
              className={cn("h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", filter === 'billed' ? "bg-slate-100 text-[#0F172A] shadow-inner" : "text-slate-400")}
            >
              {t("billed")} ({formatTotal(getFilterTotal('billed'))})
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setFilter('unbilled')}
              className={cn("h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", filter === 'unbilled' ? "bg-slate-100 text-[#0F172A] shadow-inner" : "text-slate-400")}
            >
              {t("unbilled")} ({formatTotal(getFilterTotal('unbilled'))})
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setFilter('ready_to_bill')}
              className={cn("h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", filter === 'ready_to_bill' ? "bg-slate-100 text-violet-600 shadow-inner" : "text-slate-400")}
            >
              {t("readyToBill")} ({formatTotal(getFilterTotal('ready_to_bill'))})
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-5 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Order #</th>
                <th className="px-8 py-5 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cliente</th>
                <th className="px-8 py-5 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">MOS Pieces</th>
                <th className="px-8 py-5 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Printavo Total</th>
                <th className="px-8 py-5 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order, index) => (
                <tr key={`${order.order_number}-${index}`} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6 align-middle">
                    <span className="text-sm font-black text-[#0091D5] tracking-tight">#{order.order_number}</span>
                  </td>
                  <td className="px-8 py-6 align-middle">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{order.client}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{order.mos_status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-middle">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">{order.mos_pieces}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 align-middle">
                    <span className={cn(
                      "text-sm font-black tracking-tight",
                      order.is_matched ? "text-[#0F172A]" : "text-slate-400"
                    )}>
                      ${order.printavo_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-8 py-6 align-middle">
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
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#0091D5] transition-all"
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
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-emerald-500 transition-all"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {order.printavo_status !== 'Completed' && order.printavo_status !== 'Not Found' && (
                        <span className="text-[8px] font-black text-[#0091D5] uppercase tracking-widest">
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
