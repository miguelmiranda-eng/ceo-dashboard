"use client"

import { PrintavoOrder } from "@/lib/printavo"
import { ExternalLink, DollarSign, Calendar, Factory } from "lucide-react"

interface PipelineOrdersProps {
  orders: PrintavoOrder[]
}

export function PipelineOrders({ orders }: PipelineOrdersProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="py-12 flex items-center justify-center text-[#F5F7FA]/50 font-bold uppercase tracking-widest text-xs">
        No active orders found in pipeline.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <a 
          key={o.id}
          href={o.public_url || `https://www.printavo.com/invoices/${o.id}`}
          target="_blank"
          rel="noreferrer"
          className="group block bg-[#F5F7FA] dark:bg-[#1E293B] hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 rounded-xl p-5 shadow-sm transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full inline-block">
                  PO: {o.visual_po_number || o.visual_id}
                </span>
                <span 
                  className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full inline-block"
                  style={{ backgroundColor: `${o.orderstatus?.color}20`, color: o.orderstatus?.color }}
                >
                  {o.orderstatus?.name || "Active"}
                </span>
              </div>
              
              <h4 className="text-sm font-bold text-[#0B1F3A] dark:text-white leading-tight mb-2 line-clamp-1">
                {o.order_nickname}
              </h4>
              
              <div className="flex items-center gap-4 text-xs font-bold text-[#0B1F3A]/60 dark:text-slate-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wide">
                  <Factory className="h-3.5 w-3.5" />
                  {o.customer?.company || "Unknown Client"}
                </span>
                {o.customer_due_date && (
                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(o.customer_due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 sm:pl-4 sm:border-l sm:border-[#0B1F3A]/10 dark:sm:border-slate-700">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B1F3A]/50 dark:text-slate-500 mb-0.5">
                  Revenue
                </span>
                <span className="text-xl font-black text-[#0B1F3A] dark:text-white flex items-center justify-end tracking-tighter">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  {o.order_total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#0B1F3A]/5 dark:bg-slate-700 flex items-center justify-center text-[#0B1F3A] dark:text-white group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
