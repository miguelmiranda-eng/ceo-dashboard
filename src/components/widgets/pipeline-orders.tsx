"use client"

import { useState } from "react"
import { PrintavoOrder } from "@/lib/printavo"
import { ExternalLink, DollarSign, Calendar, Factory, LayoutGrid, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface PipelineOrdersProps {
  orders: PrintavoOrder[]
  tableros?: string[]
}

export function PipelineOrders({ orders, tableros = [] }: PipelineOrdersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  if (!orders || orders.length === 0) {
    return (
      <div className="py-12 flex items-center justify-center text-[#F5F7FA]/50 font-bold uppercase tracking-widest text-xs">
        No active orders found in pipeline.
      </div>
    )
  }

  const filteredOrders = !selectedCategory 
    ? orders 
    : selectedCategory === "Maquinaria"
      ? orders.filter(o => !!o.mos_machine)
      : orders.filter(o => o.orderstatus?.name?.toLowerCase().includes(selectedCategory.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Filtering Navigation - Logistics Boards */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1F3A]/40 dark:text-slate-500 ml-1">
          Flujo Logístico
        </p>
        <div className="flex flex-wrap gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
              !selectedCategory 
                ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-lg shadow-blue-500/10" 
                : "bg-white dark:bg-slate-900 text-[#0B1F3A]/60 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-500/40"
            )}
          >
            Todos
          </button>
          
          {tableros.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2",
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" 
                  : "bg-white dark:bg-slate-900 text-[#0B1F3A]/60 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-500/40"
              )}
            >
              {cat === "Maquinaria" ? <LayoutGrid className="h-3 w-3" /> : <Package className="h-3 w-3" />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-16 bg-[#0B1F3A]/5 dark:bg-slate-800/50 rounded-2xl border border-dashed border-[#0B1F3A]/10 dark:border-slate-700 flex flex-col items-center justify-center text-center px-6">
            <Package className="h-8 w-8 text-[#0B1F3A]/20 dark:text-slate-600 mb-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B1F3A]/40 dark:text-slate-500">
              No hay órdenes pendientes en este tablero
            </p>
          </div>
        ) : (
          filteredOrders.map((o) => (
            <a 
              key={o.id}
              href={o.public_url || `https://www.printavo.com/invoices/${o.id}`}
              target="_blank"
              rel="noreferrer"
              className="group block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 bg-blue-600/5 px-2.5 py-1 rounded-lg inline-block border border-blue-600/10">
                      PO: {o.visual_po_number || o.visual_id}
                    </span>
                    <span 
                      className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-lg inline-block border"
                      style={{ backgroundColor: `${o.orderstatus?.color}10`, color: o.orderstatus?.color, borderColor: `${o.orderstatus?.color}20` }}
                    >
                      {o.orderstatus?.name || "Active"}
                    </span>
                    {o.mos_machine && (
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 bg-emerald-600/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-600/10">
                        <LayoutGrid className="h-3 w-3" />
                        {o.mos_machine}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-bold text-[#0B1F3A] dark:text-white leading-snug mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {o.order_nickname}
                  </h4>
                  
                  <div className="flex items-center gap-4 text-[10px] font-bold text-[#0B1F3A]/50 dark:text-slate-500">
                    <span className="flex items-center gap-1.5 uppercase tracking-widest">
                      <Factory className="h-3.5 w-3.5 opacity-50" />
                      {o.customer?.company || "Unknown Client"}
                    </span>
                    {o.customer_due_date && (
                      <span className="flex items-center gap-1.5 uppercase tracking-widest">
                        <Calendar className="h-3.5 w-3.5 opacity-50" />
                        {new Date(o.customer_due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:pl-5 sm:border-l sm:border-slate-100 dark:sm:border-slate-800">
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#0B1F3A]/30 dark:text-slate-600 mb-1">
                      Revenue
                    </span>
                    <span className="text-xl font-black text-[#0B1F3A] dark:text-white flex items-center justify-end tracking-tighter">
                      <DollarSign className="h-4 w-4 text-emerald-500 opacity-70" />
                      {o.order_total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-[#0B1F3A]/5 dark:bg-slate-800 flex items-center justify-center text-[#0B1F3A]/30 dark:text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}


