"use client"

import React, { useState } from "react"
import useSWR from "swr"
import { 
  Plus, 
  Search, 
  FileText, 
  MoreVertical, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  LayoutGrid,
  List,
  User,
  ArrowUpDown,
  Activity,
  Zap,
  Layers
} from "lucide-react"
import { 
  fetchWorkOrders, 
  WorkOrder,
} from "@/lib/api"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { InvoiceForm } from "@/components/dashboard/invoices/InvoiceForm"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"

const STATUS_COLUMNS = [
  { id: 'artwork_pending', label: 'Art Pending', color: 'bg-slate-500', icon: FileText },
  { id: 'artwork_approved', label: 'Art Approved', color: 'bg-blue-500', icon: CheckCircle2 },
  { id: 'production', label: 'Production', color: 'bg-amber-500', icon: Zap },
  { id: 'quality_check', label: 'QC', color: 'bg-purple-500', icon: Activity },
  { id: 'completed', label: 'Done', color: 'bg-emerald-500', icon: CheckCircle2 },
]

// ─── Simple Work Order Dialog ──────────────────────────────────────────────────
function WorkOrderDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  isSaving,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialData?: any
  onSave: (data: any) => void
  isSaving: boolean
}) {
  const isEditing = !!initialData
  const [form, setForm] = React.useState({
    source_invoice_id: initialData?.source_invoice_id || "",
    production_status: initialData?.production_status || "artwork_pending",
    production_notes: initialData?.production_notes || "",
    assigned_operator: initialData?.assigned_operator || "",
    scheduled_date: initialData?.scheduled_date || "",
    art_links: (initialData?.art_links || []).join("\n"),
  })

  // Reset form when dialog opens with new data
  React.useEffect(() => {
    setForm({
      source_invoice_id: initialData?.source_invoice_id || "",
      production_status: initialData?.production_status || "artwork_pending",
      production_notes: initialData?.production_notes || "",
      assigned_operator: initialData?.assigned_operator || "",
      scheduled_date: initialData?.scheduled_date || "",
      art_links: (initialData?.art_links || []).join("\n"),
    })
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      source_invoice_id: form.source_invoice_id || "MANUAL",
      production_status: form.production_status,
      production_notes: form.production_notes,
      assigned_operator: form.assigned_operator,
      scheduled_date: form.scheduled_date,
      art_links: form.art_links ? form.art_links.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
      packing_details: initialData?.packing_details || { bags: "individual", labels: "hanging", boxes: "master" },
    })
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white border-slate-200">
        <DialogTitle className="text-slate-900 font-black uppercase tracking-widest text-sm">
          {isEditing ? `Edit: ${initialData?.work_order_id}` : "New Work Order"}
        </DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Source Invoice ID</Label>
              <Input value={form.source_invoice_id} onChange={f("source_invoice_id")} placeholder="e.g. M-01 or MANUAL" className="h-9 text-xs border-slate-200" />
            </div>
            <div>
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Status</Label>
              <select value={form.production_status} onChange={f("production_status")}
                className="w-full h-9 text-xs border border-slate-200 rounded-md px-2 bg-white text-slate-900 font-bold uppercase">
                {STATUS_COLUMNS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Operator</Label>
              <Input value={form.assigned_operator} onChange={f("assigned_operator")} placeholder="Name or email" className="h-9 text-xs border-slate-200" />
            </div>
            <div className="col-span-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Scheduled Date</Label>
              <Input type="date" value={form.scheduled_date} onChange={f("scheduled_date")} className="h-9 text-xs border-slate-200" />
            </div>
            <div className="col-span-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Art Links (one per line)</Label>
              <textarea value={form.art_links} onChange={f("art_links")} rows={3}
                placeholder="https://..."
                className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="col-span-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Production Notes</Label>
              <textarea value={form.production_notes} onChange={f("production_notes")} rows={3}
                placeholder="Special instructions..."
                className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#0091D5] hover:bg-[#0081C0] text-white shadow-lg shadow-blue-500/20" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function WorkOrdersPage() {
  const { t } = useI18n()
  const [search, setSearch] = useState("")
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sorting, setSorting] = useState<SortingState>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data: workOrders, error, mutate } = useSWR(
    ['work-orders', search],
    () => fetchWorkOrders({ search })
  )

  const handleCreateOrder = async (data: any) => {
    setIsSaving(true)
    try {
      // Logic redirection: Creating an Invoice automatically generates the M-XX ID,
      // syncs it to MOS production, and creates the associated Work Order.
      console.log("[WorkOrders] Creating full Invoice/MOS/WO flow with data:", data)
      console.log("[WorkOrders] URL: /api/mos?endpoint=invoices")

      const res = await fetch(`/api/mos?endpoint=invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await res.json()
      if (!res.ok) {
        let errMsg = 'Error al procesar la orden completa';
        if (result.detail) {
          errMsg = typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail);
        } else if (result.error) {
          errMsg = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
        } else {
          errMsg = JSON.stringify(result);
        }
        throw new Error(errMsg)
      }

      console.log("[WorkOrders] Success! Created ID:", result.invoice_id)
      setIsCreating(false)
      mutate()
    } catch (err: any) {
      console.error("Full order creation flow failed:", err)
      const errorMsg = err.message || "Error desconocido";
      if (errorMsg.includes("Request Entity Too Large") || errorMsg.includes("payload too large")) {
        alert("¡Error de tamaño! Las imágenes son demasiado pesadas. Por favor, intenta usar imágenes más pequeñas o menos archivos.");
      } else {
        alert(`Error al procesar el flujo completo: ${errorMsg}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditOrder = async (workOrder: any) => {
    // If it's a manual order without an invoice, we just edit the work order
    if (!workOrder.source_invoice_id || workOrder.source_invoice_id === "MANUAL") {
      setEditingOrder(workOrder)
      return
    }

    setIsSaving(true)
    try {
      // Fetch full invoice data to populate the form correctly
      const res = await fetch(`/api/mos?endpoint=invoices/${workOrder.source_invoice_id}`)
      if (!res.ok) throw new Error("Could not load invoice details")
      
      const fullInvoice = await res.json()
      // Merge work order production data into the invoice data for the form
      setEditingOrder({
        ...fullInvoice,
        work_order_id: workOrder.work_order_id,
        production_status: workOrder.production_status,
        production_notes: workOrder.production_notes,
        assigned_operator: workOrder.assigned_operator,
        scheduled_date: workOrder.scheduled_date,
        art_links: workOrder.art_links
      })
    } catch (err) {
      console.error("Error loading full details:", err)
      // Fallback to work order data if invoice can't be loaded
      setEditingOrder(workOrder)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateOrder = async (data: any) => {
    if (!editingOrder) return
    setIsSaving(true)
    try {
      // 1. Update the Invoice (This is where the items/description live)
      let invoiceUpdateSuccess = false;
      const targetInvoiceId = editingOrder.source_invoice_id || editingOrder.invoice_id || editingOrder.work_order_id;
      
      if (targetInvoiceId && targetInvoiceId !== "MANUAL") {
        const invoiceRes = await fetch(`/api/mos?endpoint=invoices/${targetInvoiceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (!invoiceRes.ok) {
           console.error("Failed to update invoice data:", await invoiceRes.text());
        } else {
           invoiceUpdateSuccess = true;
        }
      }

      // 2. Update the Work Order specifically
      // We also send the items here just in case the backend needs them to stay in sync
      const woData = {
        production_status: data.production_status,
        production_notes: data.production_notes,
        assigned_operator: data.assigned_operator,
        scheduled_date: data.scheduled_date,
        art_links: data.art_links,
        packing_details: data.packing_details,
        items: data.items,
        print_location: data.print_location,
        garment_info: data.garment_info,
        client: data.client
      }
      
      const res = await fetch(`/api/mos?endpoint=work-orders/${editingOrder.work_order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(woData)
      })

      if (!res.ok) {
        const err = await res.json()
        let errMsg = 'Error al actualizar la orden de trabajo';
        if (err.detail) {
          errMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
        } else if (err.error) {
          errMsg = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
        } else {
          errMsg = JSON.stringify(err);
        }
        throw new Error(errMsg)
      }
      
      if (!invoiceUpdateSuccess && targetInvoiceId !== "MANUAL") {
         alert("¡Advertencia! La orden de trabajo se actualizó, pero los ítems/descripción no se pudieron guardar en la factura principal. Posible error de servidor.");
      }

      setEditingOrder(null)
      mutate()
    } catch (err: any) {
      console.error(err)
      alert(`Error al actualizar la orden: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const columns = [
    {
      accessorKey: "work_order_id",
      header: ({ column }: any) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="pl-0 font-black uppercase tracking-widest text-[10px] text-slate-500 hover:text-blue-600 transition-colors">
          WO ID <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }: any) => (
        <div className="font-black text-[#0091D5] tracking-tighter text-sm">{row.getValue("work_order_id")}</div>
      ),
    },
    {
      accessorKey: "source_invoice_id",
      header: () => <div className="font-black uppercase tracking-widest text-[10px] text-slate-500">Source ID</div>,
      cell: ({ row }: any) => <div className="font-bold text-slate-400 text-[11px] uppercase tracking-tight">{row.getValue("source_invoice_id")}</div>,
    },
    {
      accessorKey: "production_status",
      header: () => <div className="font-black uppercase tracking-widest text-[10px] text-slate-500">Status</div>,
      cell: ({ row }: any) => {
        const status = row.getValue("production_status") as string
        const woId = row.original.work_order_id
        const config = STATUS_COLUMNS.find(c => c.id === status) || STATUS_COLUMNS[0]
        const Icon = config.icon
        
        const handleStatusChange = async (newStatus: string) => {
          setIsSaving(true)
          try {
            await fetch(`/api/mos?endpoint=work-orders/${woId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ production_status: newStatus })
            })
            mutate()
          } catch (err) {
            console.error(err)
          } finally {
            setIsSaving(false)
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                <Badge variant="outline" className={cn(
                  "uppercase text-[9px] font-black px-2 py-1 flex items-center gap-1.5 w-fit border rounded-full bg-white shadow-sm cursor-pointer hover:scale-105 transition-all", 
                  config.color.replace('bg-', 'text-')
                )}>
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white border-slate-200 shadow-xl min-w-[160px] p-1">
              {STATUS_COLUMNS.map((opt) => (
                <DropdownMenuItem 
                  key={opt.id}
                  onClick={() => handleStatusChange(opt.id)}
                  className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50 rounded-md transition-colors"
                >
                  <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">{opt.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: "assigned_operator",
      header: () => <div className="font-black uppercase tracking-widest text-[10px] text-slate-500">Operator</div>,
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="h-3 w-3" />
           </div>
           <span className="text-[11px] font-bold text-slate-700">{row.getValue("assigned_operator") || "Unassigned"}</span>
        </div>
      ),
    },
    {
      accessorKey: "scheduled_date",
      header: () => <div className="font-black uppercase tracking-widest text-[10px] text-slate-500 text-right">Scheduled</div>,
      cell: ({ row }: any) => (
        <div className="text-slate-500 text-[11px] text-right font-bold uppercase tracking-tight">{row.getValue("scheduled_date") || "TBD"}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all rounded-full">
                <MoreVertical className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700 shadow-xl min-w-[180px]">
              <DropdownMenuItem 
                onClick={() => handleEditOrder(row.original)}
                className="hover:bg-slate-50 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-tight p-3"
              >
                <ExternalLink className="h-4 w-4 text-[#0091D5]" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-50 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-tight p-3">
                <Clock className="h-4 w-4 text-amber-500" /> Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (confirm("Are you sure you want to cancel/delete this order?")) {
                    try {
                      const res = await fetch(`/api/mos?endpoint=work-orders/${row.original.work_order_id}`, { method: 'DELETE' })
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}))
                        throw new Error(err.error || err.detail || `Error ${res.status}`)
                      }
                      mutate()
                    } catch (err: any) {
                      console.error(err)
                      alert(`Error deleting order: ${err.message}`)
                    }
                  }
                }}
                className="hover:bg-rose-50 text-rose-600 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-tight p-3"
              >
                <XCircle className="h-4 w-4" /> Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: workOrders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  const stats = workOrders?.reduce((acc: any, wo: any) => ({
    total: acc.total + 1,
    inProd: acc.inProd + (wo.production_status === 'production' ? 1 : 0),
    completed: acc.completed + (wo.production_status === 'completed' ? 1 : 0)
  }), { total: 0, inProd: 0, completed: 0 })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-1">
      <LoadingOverlay isLoading={isSaving} message="Updating Order..." />

      {/* Full InvoiceForm Modal — Create & Edit */}
      <Dialog open={isCreating || !!editingOrder} onOpenChange={(open) => { if (!open) { setIsCreating(false); setEditingOrder(null); } }}>
        <DialogContent className="max-w-none w-screen h-screen p-0 bg-transparent border-none shadow-none overflow-y-auto m-0 rounded-none flex flex-col">
          <DialogTitle className="sr-only">{editingOrder ? "Edit Production Order" : "Create New Production Order"}</DialogTitle>
          <div className="flex-1 w-full max-w-[1600px] mx-auto py-10 px-6">
            <InvoiceForm
              initialData={editingOrder}
              onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
              onCancel={() => { setIsCreating(false); setEditingOrder(null); }}
              isLoading={isSaving}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-12 bg-[#0091D5] rounded-full shadow-[0_0_20px_rgba(0,145,213,0.4)]" />
             <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase italic leading-none">
                {t("workOrders")}
             </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 opacity-70">
            Prosper Manufacturing &bull; Production Control Pipeline
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
             <Button 
               variant="ghost" 
               onClick={() => setView('grid')}
               className={cn("h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", view === 'grid' ? "bg-slate-100 text-[#0091D5] shadow-inner" : "text-slate-400")}
             >
               <LayoutGrid className="mr-2 h-4 w-4" /> Grid
             </Button>
             <Button 
               variant="ghost" 
               onClick={() => setView('list')}
               className={cn("h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", view === 'list' ? "bg-slate-100 text-[#0091D5] shadow-inner" : "text-slate-400")}
             >
               <List className="mr-2 h-4 w-4" /> List
             </Button>
          </div>

          <Button 
            onClick={() => setIsCreating(true)}
            className="h-14 px-8 bg-[#0091D5] hover:bg-[#0081C0] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-3"
          >
            <Plus className="h-5 w-5" strokeWidth={3} />
            Nueva Orden
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
               <div className="flex items-center">
                  <div className="w-2 h-24 bg-[#0091D5] shadow-[0_0_20px_rgba(0,145,213,0.2)]" />
                  <div className="p-8 flex items-center gap-6 w-full">
                     <div className="w-14 h-14 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-[#0091D5] shadow-inner group-hover:scale-110 transition-transform">
                        <Layers className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Pipeline</p>
                        <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{stats?.total || 0} Orders</p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
               <div className="flex items-center">
                  <div className="w-2 h-24 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" />
                  <div className="p-8 flex items-center gap-6 w-full">
                     <div className="w-14 h-14 bg-amber-50 rounded-[1.25rem] flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                        <Zap className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">In Production</p>
                        <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{stats?.inProd || 0} Units</p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
               <div className="flex items-center">
                  <div className="w-2 h-24 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
                  <div className="p-8 flex items-center gap-6 w-full">
                     <div className="w-14 h-14 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed</p>
                        <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{stats?.completed || 0} Finished</p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search work orders, POs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-14 bg-white border-slate-200 text-slate-900 h-14 rounded-2xl focus:ring-2 focus:ring-[#0091D5]/20 transition-all border-2 text-sm"
            />
          </div>
          <Button variant="outline" className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
            <Filter className="mr-3 h-5 w-5" /> Filters
          </Button>
        </div>

        {view === 'grid' ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-5 gap-6 overflow-x-auto min-h-[600px] bg-slate-50/20">
            {STATUS_COLUMNS.map((column) => (
              <div key={column.id} className="flex flex-col min-w-[280px] space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", column.color)} />
                    <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">{column.label}</h3>
                  </div>
                  <Badge variant="outline" className="bg-white text-slate-400 border-slate-200 text-[10px] font-black">
                    {workOrders?.filter((wo: any) => wo.production_status === column.id).length || 0}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {workOrders?.filter((wo: any) => wo.production_status === column.id).map((wo: any) => (
                    <WorkOrderCard key={wo.work_order_id} workOrder={wo} onUpdate={() => mutate()} onEdit={handleEditOrder} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-slate-50/30">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-8 py-5 border-b border-slate-100">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-8 py-6 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="h-48 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                       No active work orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  )
}

function WorkOrderCard({ workOrder, onUpdate, onEdit }: { workOrder: WorkOrder, onUpdate: () => void, onEdit: (order: any) => void }) {
  const config = STATUS_COLUMNS.find(c => c.id === workOrder.production_status) || STATUS_COLUMNS[0]
  const Icon = config.icon
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      await fetch(`/api/mos?endpoint=work-orders/${workOrder.work_order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ production_status: newStatus })
      })
      onUpdate()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-[#0091D5]/40 transition-all cursor-pointer group overflow-hidden rounded-2xl">
      <div className="p-5 space-y-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-black text-[#0091D5] tracking-tighter uppercase">{workOrder.work_order_id}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REF: {workOrder.source_invoice_id}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <MoreVertical className="h-4 w-4 text-slate-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-xl min-w-[140px] p-1">
              <DropdownMenuItem 
                onClick={() => onEdit(workOrder)}
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50 rounded-md"
              >
                <ExternalLink className="h-3 w-3 text-blue-600" /> 
                <span className="text-[10px] font-bold uppercase">Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this order?")) {
                    try {
                      const res = await fetch(`/api/mos?endpoint=work-orders/${workOrder.work_order_id}`, { method: 'DELETE' })
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}))
                        throw new Error(err.error || err.detail || `Error ${res.status}`)
                      }
                      onUpdate()
                    } catch (err: any) {
                      console.error(err)
                      alert(`Error deleting order: ${err.message}`)
                    }
                  }
                }}
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-rose-50 text-rose-600 rounded-md"
              >
                <XCircle className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="h-auto p-0 hover:bg-transparent block text-left">
                  <Badge variant="outline" className={cn(
                    "uppercase text-[8px] font-black px-2 py-0.5 flex items-center gap-1.5 w-fit border rounded-full bg-white shadow-sm cursor-pointer hover:scale-105 transition-all", 
                    config.color.replace('bg-', 'text-')
                  )}>
                    <Icon className="h-2.5 w-2.5" />
                    {config.label}
                  </Badge>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="bg-white border-slate-200 shadow-xl min-w-[150px] p-1">
               {STATUS_COLUMNS.map((opt) => (
                 <DropdownMenuItem 
                   key={opt.id}
                   onClick={(e) => { e.stopPropagation(); handleStatusChange(opt.id); }}
                   className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50 rounded-md"
                 >
                   <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                   <span className="text-[9px] font-black uppercase tracking-tight text-slate-700">{opt.label}</span>
                 </DropdownMenuItem>
               ))}
             </DropdownMenuContent>
           </DropdownMenu>

           <div className="space-y-2">
             <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-100 text-[8px] font-black uppercase px-1.5 py-0">
                   {workOrder.packing_details?.bags || 'standard'}
                </Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-100 text-[8px] font-black uppercase px-1.5 py-0">
                   {workOrder.packing_details?.boxes || 'master'}
                </Badge>
             </div>
             <p className="text-[11px] text-slate-600 font-bold line-clamp-2 leading-tight uppercase italic">
                {workOrder.production_notes || "No additional production instructions."}
             </p>
           </div>
        </div>

        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                 <User className="h-3 w-3" />
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase truncate max-w-[70px]">
                 {workOrder.assigned_operator || "UNASSIGNED"}
              </span>
           </div>
           <div className="flex items-center text-slate-400 gap-1 text-[9px] font-black uppercase">
              <Clock className="h-3 w-3" />
              {workOrder.scheduled_date || "TBD"}
           </div>
        </div>
      </div>
      <div className={cn("h-1 w-full bg-slate-100 group-hover:transition-colors", config.color)} />
    </Card>
  )
}
