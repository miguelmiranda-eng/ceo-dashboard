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
          <div className="flex items-center gap-3">
             <div className="w-2 h-10 bg-primary rounded-full" />
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                Administrar Etiquetas
             </h1>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-5">
            Personalización de Flujos de Trabajo &bull; Identidad Visual
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          {saving ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Invoice Statuses */}
        <Card className="bg-white border-slate-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <FileText className="h-6 w-6" />
               </div>
               <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Estados de Facturación</CardTitle>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lifecycle de Documentos Comerciales</p>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {invoiceStatuses.map((status, index) => (
              <div key={status.id} className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all shadow-sm">
                <GripVertical className="h-5 w-5 text-slate-200 group-hover:text-slate-400 cursor-move transition-colors" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado ID: {status.id}</p>
                    <Badge variant="outline" className={cn(status.color, status.text, "font-black uppercase text-[9px] px-2 py-0.5 border")}>
                       Preview: {status.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Etiqueta Visual</label>
                       <Input 
                         value={status.label} 
                         onChange={(e) => {
                           const newStatuses = [...invoiceStatuses]
                           newStatuses[index].label = e.target.value
                           setInvoiceStatuses(newStatuses)
                         }}
                         className="h-10 bg-white border-slate-200 font-bold text-xs uppercase rounded-lg focus:ring-2 focus:ring-blue-500/20"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Estilo (Tailwind Class)</label>
                       <Input 
                         value={status.color} 
                         onChange={(e) => {
                           const newStatuses = [...invoiceStatuses]
                           newStatuses[index].color = e.target.value
                           setInvoiceStatuses(newStatuses)
                         }}
                         className="h-10 bg-white border-slate-200 font-mono text-[10px] rounded-lg focus:ring-2 focus:ring-blue-500/20"
                       />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed border-2 border-slate-200 text-slate-400 font-black uppercase text-[10px] h-12 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all">
               <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Estado de Factura
            </Button>
          </CardContent>
        </Card>

        {/* Production Statuses */}
        <Card className="bg-white border-slate-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                  <Zap className="h-6 w-6" />
               </div>
               <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Estados de Producción</CardTitle>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pipeline Operativo de Manufactura</p>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {productionStatuses.map((status, index) => (
              <div key={status.id} className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/10 transition-all shadow-sm">
                <GripVertical className="h-5 w-5 text-slate-200 group-hover:text-slate-400 cursor-move transition-colors" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fase ID: {status.id}</p>
                    <Badge variant="outline" className={cn(status.color, status.text, "font-black uppercase text-[9px] px-2 py-0.5 border shadow-sm")}>
                       Pipeline: {status.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nombre de la Fase</label>
                       <Input 
                         value={status.label} 
                         onChange={(e) => {
                           const newStatuses = [...productionStatuses]
                           newStatuses[index].label = e.target.value
                           setProductionStatuses(newStatuses)
                         }}
                         className="h-10 bg-white border-slate-200 font-bold text-xs uppercase rounded-lg focus:ring-2 focus:ring-amber-500/20"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Color de Fondo</label>
                       <Input 
                         value={status.color} 
                         onChange={(e) => {
                           const newStatuses = [...productionStatuses]
                           newStatuses[index].color = e.target.value
                           setProductionStatuses(newStatuses)
                         }}
                         className="h-10 bg-white border-slate-200 font-mono text-[10px] rounded-lg focus:ring-2 focus:ring-amber-500/20"
                       />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed border-2 border-slate-200 text-slate-400 font-black uppercase text-[10px] h-12 rounded-xl hover:border-amber-300 hover:text-amber-600 transition-all">
               <Plus className="mr-2 h-4 w-4" /> Añadir Nueva Fase de Producción
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
