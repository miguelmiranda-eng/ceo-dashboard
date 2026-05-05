"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { useDashboardFilters } from "@/lib/filter-context"
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ArrowUpDown,
  FileText,
  DollarSign,
  Package,
  TrendingUp,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MatchingOrder {
  order_number: string
  client: string
  mos_status: string
  mos_pieces: number
  mos_produced: number
  printavo_id: number | null
  printavo_total: number
  printavo_status: string
  is_matched: boolean
  printavo_url: string | null
  invoice_url: string | null
  updated_at: string
}

interface MatchingStats {
  total_orders: number
  billed_count: number
  unbilled_count: number
  total_value_matched: number
  total_pieces_produced: number
  total_pieces_billed: number
  total_pieces_ready: number
}

export default function MatchingPage() {
  const { t } = useI18n()
  const { filters: globalFilters, setFilters } = useDashboardFilters()
  const [data, setData] = useState<{ stats: MatchingStats; orders: MatchingOrder[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<'all' | 'final_bill' | 'completed'>('all')
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const now = new Date()
      const fmt = (d: Date) => d.toISOString().substring(0, 10) // YYYY-MM-DD

      const preset = globalFilters.preset

      // Convert preset to concrete date_from / date_to
      if (preset === 'today') {
        params.set('date_from', fmt(now))
        params.set('date_to', fmt(now))
      } else if (preset === 'yesterday') {
        const y = new Date(now); y.setDate(now.getDate() - 1)
        params.set('date_from', fmt(y))
        params.set('date_to', fmt(y))
      } else if (preset === 'week') {
        const day = now.getDay() || 7 // Mon=1 ... Sun=7
        const mon = new Date(now); mon.setDate(now.getDate() - day + 1)
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
        params.set('date_from', fmt(mon))
        params.set('date_to', fmt(sun))
      } else if (preset === 'month') {
        const from = new Date(now.getFullYear(), now.getMonth(), 1)
        const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        params.set('date_from', fmt(from))
        params.set('date_to', fmt(to))
      } else if (preset === 'custom' && customFrom && customTo) {
        params.set('date_from', customFrom)
        params.set('date_to', customTo)
      }
      // If preset is "all" or empty — send no dates so backend returns full history
      
      setError(null)
      const res = await fetch(`/api/matching?${params.toString()}`)
      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || "Error al sincronizar datos")
      }
      
      setData(json)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [globalFilters.preset, globalFilters.date_from, globalFilters.date_to, customFrom, customTo])

  const filteredOrders = data?.orders?.filter(o => {
    if (!o) return false;
    const matchesSearch = (o.order_number || "").toLowerCase().includes(search.toLowerCase()) || 
                          (o.client || "").toLowerCase().includes(search.toLowerCase())
    
    let matchesFilter = true;
    if (filter === 'completed') matchesFilter = o.printavo_status === 'Completed';
    if (filter === 'final_bill') matchesFilter = o.printavo_status === 'Final Bill';

    return matchesSearch && matchesFilter
  }) || []

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <LoadingOverlay isLoading={loading} message="Sincronizando Sistemas..." />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight uppercase italic flex items-center gap-3">
            <span className="w-2 h-10 bg-blue-600 rounded-full inline-block" />
            Conciliación Directa
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-5">
            MOS Production vs Printavo Billing
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Periodo */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400 ml-2" />
            <Select 
              value={globalFilters.preset || 'week'} 
              onValueChange={(val) => {
                setFilters({ preset: val })
                if (val !== 'custom') { setCustomFrom(''); setCustomTo('') }
              }}
            >
              <SelectTrigger className="w-[200px] border-none bg-transparent font-black uppercase text-[10px] tracking-widest focus:ring-0">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                <SelectItem value="today" className="font-bold text-[10px] uppercase">Hoy</SelectItem>
                <SelectItem value="yesterday" className="font-bold text-[10px] uppercase">Ayer</SelectItem>
                <SelectItem value="week" className="font-bold text-[10px] uppercase">Esta Semana</SelectItem>
                <SelectItem value="month" className="font-bold text-[10px] uppercase">Este Mes</SelectItem>
                <SelectItem value="all" className="font-bold text-[10px] uppercase">Todo el Historial</SelectItem>
                <SelectItem value="custom" className="font-bold text-[10px] uppercase">📅 Rango Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range — shown only when 'custom' is selected */}
          {globalFilters.preset === 'custom' && (
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-blue-200 animate-in fade-in duration-300">
              <span className="text-[10px] font-black uppercase text-slate-400">De</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="text-[11px] font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              />
              <span className="text-[10px] font-black uppercase text-slate-400">a</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-[11px] font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              />
            </div>
          )}

          <Button 
            onClick={fetchData} 
            disabled={loading || (globalFilters.preset === 'custom' && (!customFrom || !customTo))}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black uppercase tracking-widest text-[10px] px-8 h-14 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3"
          >
            <ArrowUpDown className={cn("w-4 h-4", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>
            {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-sm font-black text-red-800 uppercase tracking-wider">Error de Sincronización</p>
              <p className="text-xs font-bold text-red-600 mt-1 uppercase">{error}</p>
            </div>
          </div>
          <p className="text-[10px] text-red-400 mt-4 font-bold uppercase italic">
            Verifica que MOS_BACKEND_URL esté configurado correctamente en Vercel.
          </p>
        </div>
      )}

      {/* Hero Stats */}
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-8", error && "opacity-50 pointer-events-none")}>
        <Card className="bg-white border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Piezas Pintadas (MOS)</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-6xl font-black text-[#0F172A] tracking-tighter">
                {data?.stats?.total_pieces_produced?.toLocaleString() || "0"}
              </h2>
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Unidades</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 w-fit px-3 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              Producción Verificada
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0091D5] border-none shadow-2xl shadow-blue-500/30 rounded-[2.5rem] overflow-hidden group text-white">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-24 h-24 text-white" />
            </div>
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-4">Listo para Cobro (Final Bill)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tighter opacity-70">$</span>
              <h2 className="text-5xl font-black tracking-tighter">
                {data?.stats?.total_pieces_ready
                  ? data.stats.total_pieces_ready.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                  : "0"}
              </h2>
              <span className="text-blue-100 font-bold text-xs uppercase tracking-widest">USD</span>
            </div>
            <div className="mt-2 text-[10px] text-blue-200 font-semibold">{data?.stats?.unbilled_count || 0} órdenes pendientes</div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-wider bg-white/20 w-fit px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
              <AlertCircle className="w-3 h-3" />
              Pendiente de Facturar
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500 border-none shadow-2xl shadow-emerald-500/30 rounded-[2.5rem] overflow-hidden group text-white">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="w-24 h-24 text-white" />
            </div>
            <p className="text-[10px] font-black text-emerald-50 uppercase tracking-[0.2em] mb-4">Cobrado (Completed)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tighter opacity-70">$</span>
              <h2 className="text-5xl font-black tracking-tighter">
                {data?.stats?.total_pieces_billed
                  ? data.stats.total_pieces_billed.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                  : "0"}
              </h2>
              <span className="text-emerald-50 font-bold text-xs uppercase tracking-widest">USD</span>
            </div>
            <div className="mt-2 text-[10px] text-emerald-100 font-semibold">{data?.stats?.billed_count || 0} órdenes cobradas</div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-wider bg-white/20 w-fit px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3" />
              Ingreso Confirmado
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
          <Input 
            placeholder="Buscar por orden o cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-16 bg-slate-50 border-transparent text-slate-900 h-16 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl">
          <Button 
            variant="ghost" 
            onClick={() => setFilter('all')}
            className={cn(
              "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", 
              filter === 'all' ? "bg-white text-blue-600 shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Todos
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setFilter('final_bill')}
            className={cn(
              "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", 
              filter === 'final_bill' ? "bg-[#0091D5] text-white shadow-lg shadow-blue-500/30" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Por Cobrar
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setFilter('completed')}
            className={cn(
              "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", 
              filter === 'completed' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Cobrados
          </Button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Orden / Cliente</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-center">Progreso de Pintura</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-center">Status Cobro</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No hay registros en este periodo
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={`${order.order_number}-${index}`} className="hover:bg-blue-50/20 transition-all group cursor-pointer">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 font-black text-xs shadow-inner">
                          #{order.order_number}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{order.client}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{order.mos_status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-900">{order.mos_produced}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">/ {order.mos_pieces}</span>
                        </div>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={cn(
                              "h-full transition-all duration-1000",
                              order.mos_produced >= order.mos_pieces ? "bg-emerald-500" : "bg-blue-500"
                            )} 
                            style={{ width: `${Math.min(100, (order.mos_produced / order.mos_pieces) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-center">
                         {order.printavo_status === 'Completed' ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest">COBRADO</span>
                            </div>
                          ) : order.printavo_status === 'Final Bill' ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0091D5] text-white shadow-lg shadow-blue-500/20">
                              <DollarSign className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest">LISTO PARA COBRO</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200">
                              <AlertCircle className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest">{order.printavo_status}</span>
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-black text-slate-900 tracking-tighter">
                          ${order.printavo_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <div className="flex items-center gap-2">
                          {order.printavo_url && (
                            <a href={order.printavo_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {order.invoice_url && (
                            <a href={order.invoice_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                              <FileText className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
