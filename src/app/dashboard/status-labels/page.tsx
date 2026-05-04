"use client"

import React, { useState } from "react"
import { 
  Plus, 
  Search, 
  Tags, 
  Save, 
  Trash2, 
  Palette,
  GripVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Zap,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const INITIAL_INVOICE_STATUSES = [
  { id: 'draft', label: 'Quote', color: 'bg-slate-100', text: 'text-slate-500', icon: FileText },
  { id: 'sent', label: 'Invoiced', color: 'bg-blue-50', text: 'text-blue-600', icon: Clock },
  { id: 'artwork_pending', label: 'Art Pending', color: 'bg-amber-50', text: 'text-amber-600', icon: AlertCircle },
  { id: 'paid', label: 'Paid / Ready', color: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 },
  { id: 'overdue', label: 'Overdue', color: 'bg-rose-50', text: 'text-rose-600', icon: AlertCircle },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-50', text: 'text-red-500', icon: XCircle },
]

const INITIAL_PRODUCTION_STATUSES = [
  { id: 'artwork_pending', label: 'Art Pending', color: 'bg-slate-500', text: 'text-white', icon: FileText },
  { id: 'artwork_approved', label: 'Art Approved', color: 'bg-blue-500', text: 'text-white', icon: CheckCircle2 },
  { id: 'production', label: 'Production', color: 'bg-amber-500', text: 'text-white', icon: Zap },
  { id: 'quality_check', label: 'QC', color: 'bg-purple-500', text: 'text-white', icon: Activity },
  { id: 'completed', label: 'Done', color: 'bg-emerald-500', text: 'text-white', icon: CheckCircle2 },
]

export default function StatusLabelsPage() {
  const [invoiceStatuses, setInvoiceStatuses] = useState(INITIAL_INVOICE_STATUSES)
  const [productionStatuses, setProductionStatuses] = useState(INITIAL_PRODUCTION_STATUSES)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert("Configuración de etiquetas guardada con éxito.")
    }, 1000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-1">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-12 bg-[#0091D5] rounded-full shadow-[0_0_20px_rgba(0,145,213,0.4)]" />
             <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase italic leading-none">
                Administrar Etiquetas
             </h1>

          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 opacity-70">
            Personalización de Flujos de Trabajo &bull; Identidad Visual
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#0091D5] hover:bg-[#0081C0] text-white font-black uppercase text-xs tracking-widest px-8 h-14 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-3"
        >
          {saving ? <Clock className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Invoice Statuses */}
        <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-[#0091D5] shadow-inner">
                  <FileText className="h-7 w-7" />
               </div>
               <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-[#0F172A]">Estados de Facturación</CardTitle>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lifecycle de Documentos Comerciales</p>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {invoiceStatuses.map((status, index) => (
              <div key={status.id} className="group flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-[#0091D5]/30 hover:bg-blue-50/30 transition-all shadow-sm">
                <GripVertical className="h-5 w-5 text-slate-200 group-hover:text-[#0091D5] cursor-move transition-colors" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado ID: {status.id}</p>
                    <Badge variant="outline" className={cn(status.color, status.text, "font-black uppercase text-[10px] px-3 py-1 border")}>
                       Preview: {status.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Etiqueta Visual</label>
                       <Input 
                         value={status.label} 
                         onChange={(e) => {
                           const newStatuses = [...invoiceStatuses]
                           newStatuses[index].label = e.target.value
                           setInvoiceStatuses(newStatuses)
                         }}
                         className="h-12 bg-white border-slate-200 font-bold text-xs uppercase rounded-xl focus:ring-2 focus:ring-[#0091D5]/20"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Estilo (Tailwind Class)</label>
                       <Input 
                         value={status.color} 
                         onChange={(e) => {
                           const newStatuses = [...invoiceStatuses]
                           newStatuses[index].color = e.target.value
                           setInvoiceStatuses(newStatuses)
                         }}
                         className="h-12 bg-white border-slate-200 font-mono text-[10px] rounded-xl focus:ring-2 focus:ring-[#0091D5]/20"
                       />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed border-2 border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl hover:border-[#0091D5]/50 hover:text-[#0091D5] transition-all bg-slate-50/50">
               <Plus className="mr-2 h-5 w-5" strokeWidth={3} /> Añadir Nuevo Estado de Factura
            </Button>
          </CardContent>
        </Card>

        {/* Production Statuses */}
        <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-amber-50 rounded-[1.25rem] flex items-center justify-center text-amber-500 shadow-inner">
                  <Zap className="h-7 w-7" />
               </div>
               <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-[#0F172A]">Estados de Producción</CardTitle>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pipeline Operativo de Manufactura</p>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {productionStatuses.map((status, index) => (
              <div key={status.id} className="group flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/30 transition-all shadow-sm">
                <GripVertical className="h-5 w-5 text-slate-200 group-hover:text-amber-500 cursor-move transition-colors" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fase ID: {status.id}</p>
                    <Badge variant="outline" className={cn(status.color, status.text, "font-black uppercase text-[10px] px-3 py-1 border shadow-sm")}>
                       Pipeline: {status.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nombre de la Fase</label>
                       <Input 
                         value={status.label} 
                         onChange={(e) => {
                           const newStatuses = [...productionStatuses]
                           newStatuses[index].label = e.target.value
                           setProductionStatuses(newStatuses)
                         }}
                         className="h-12 bg-white border-slate-200 font-bold text-xs uppercase rounded-xl focus:ring-2 focus:ring-amber-500/20"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Color de Fondo</label>
                       <Input 
                         value={status.color} 
                         onChange={(e) => {
                           const newStatuses = [...productionStatuses]
                           newStatuses[index].color = e.target.value
                           setProductionStatuses(newStatuses)
                         }}
                         className="h-12 bg-white border-slate-200 font-mono text-[10px] rounded-xl focus:ring-2 focus:ring-amber-500/20"
                       />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed border-2 border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl hover:border-amber-400 hover:text-amber-600 transition-all bg-slate-50/50">
               <Plus className="mr-2 h-5 w-5" strokeWidth={3} /> Añadir Nueva Fase de Producción
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
