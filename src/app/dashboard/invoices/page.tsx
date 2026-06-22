"use client"

import React, { useState, useMemo } from "react"
import useSWR from "swr"
import { 
  Plus, 
  Search, 
  FileText, 
  MoreVertical, 
  ExternalLink, 
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowUpDown,
  Printer,
  DollarSign,
  Briefcase,
  Eye,
  Trash2,
  RefreshCw
} from "lucide-react"
import {
  fetchInvoices,
  fetchInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  deleteWorkOrder,
  restoreInvoice,
  Invoice
} from "@/lib/api"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import {
  INVOICE_STATUSES,
  getStatusDef,
  deriveStatus,
  canTransition,
  type InvoiceStatus,
} from "@/lib/invoice-status"
import { inRange } from "@/lib/date-range"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { InvoiceForm } from "@/components/dashboard/invoices/InvoiceForm"
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
import { MosAtlasInvoice } from "@/components/dashboard/invoices/MosAtlasInvoice"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"

// ── Submodules of "Facturas y Cotizaciones" ───────────────────────────────────
// Each route renders this same workspace scoped to a slice of the invoice
// lifecycle, so the list/form/PDF logic lives in one place.
export type InvoiceScope = "invoices" | "quotes" | "closing"

export const INVOICE_SCOPES: Record<
  InvoiceScope,
  {
    title: { en: string; es: string }
    statuses: InvoiceStatus[]
    /** Status stamped on a NEW document created from this submodule. */
    defaultStatus: InvoiceStatus
    /** Label for the "create new" button. */
    createLabel: { en: string; es: string }
  }
> = {
  invoices: {
    title: { en: "Invoices", es: "Facturas" },
    statuses: ["invoice", "paid", "overdue", "cancelled"],
    defaultStatus: "invoice",
    createLabel: { en: "New Order", es: "Nueva Orden" },
  },
  quotes: {
    title: { en: "Quotes", es: "Cotizaciones" },
    statuses: ["quote", "scheduled"],
    defaultStatus: "quote",
    createLabel: { en: "New Quote", es: "Nueva Cotización" },
  },
  closing: {
    title: { en: "Closing · Final Bill", es: "Cierre · Final Bill" },
    statuses: ["to_final_bill"],
    defaultStatus: "to_final_bill",
    createLabel: { en: "New", es: "Nuevo" },
  },
}

export function InvoicesWorkspace({ scope = "invoices" }: { scope?: InvoiceScope }) {
  const scopeCfg = INVOICE_SCOPES[scope]
  const { t, language } = useI18n()
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [isCreating, setIsCreating] = useState<any>(false)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [previewShowFinancials, setPreviewShowFinancials] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  // ── Advanced filters: Status · Client · Company · Dates (Invoice Date) ──
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [clientFilter, setClientFilter] = useState<string>("all")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handlePrint = () => {
    const printContent = document.getElementById('prosper-invoice');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Prosper Manufacturing</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-white">
          ${printContent.innerHTML}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const { data: invoices, error, mutate } = useSWR(
    ['invoices', search, showDeleted],
    () => fetchInvoices({ search, show_deleted: showDeleted } as any)
  )

  // Restrict everything in this view to the statuses that belong to the scope.
  const scopedInvoices = useMemo(
    () => (invoices || []).filter((i: Invoice) => scopeCfg.statuses.includes(deriveStatus(i))),
    [invoices, scopeCfg]
  )

  const handleCreate = async (data: Partial<Invoice>) => {
    try {
      if (data.invoice_id) {
        await updateInvoice(data.invoice_id, data)
      } else {
        // Stamp the submodule's status on brand-new docs (e.g. a quote from Cotizaciones).
        await createInvoice(data.status ? data : { ...data, status: scopeCfg.defaultStatus })
      }
      setIsCreating(false)
      mutate()
    } catch (err: any) {
      alert("Error saving the order. Please verify the data.")
    }
  }

  const handleDelete = async (id: string) => {
    const msg = showDeleted 
      ? "This order is already in the trash. Delete permanently?" 
      : "Move this order to the trash? It will stay there for 7 days."
    if (!confirm(msg)) return;
    
    try {
      await deleteInvoice(id)
      mutate()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreInvoice(id)
      mutate()
      alert("Order restored successfully!")
    } catch (err: any) {
      alert(`Error restoring: ${err.message}`)
    }
  }

  const handleOpenInvoice = async (invoiceId: string, mode: 'preview' | 'edit', fallbackInvoice?: any) => {
    try {
      const fullInvoice = await fetchInvoice(invoiceId)
      if (mode === 'preview') {
        setPreviewInvoice(fullInvoice)
      } else {
        setIsCreating(fullInvoice)
      }
    } catch (err) {
      // Fall back to list data so the UI still opens
      console.warn('[handleOpenInvoice] Full fetch failed, using list data:', err)
      if (fallbackInvoice) {
        if (mode === 'preview') setPreviewInvoice(fallbackInvoice)
        else setIsCreating(fallbackInvoice)
      } else {
        alert("Error loading invoice. Please try again.")
      }
    }
  }

  const columns = useMemo(() => [
    {
      accessorKey: "invoice_id",
      header: ({ column }: any) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="pl-0 font-black uppercase tracking-widest text-[10px] text-slate-500 hover:text-blue-600 transition-colors">
          Order ID <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }: any) => (
        <div className="font-black text-[#0091D5] tracking-tighter text-sm">{row.getValue("invoice_id")}</div>
      ),
    },
    {
      accessorKey: "client",
      header: ({ column }: any) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="pl-0 font-black uppercase tracking-widest text-[10px] text-slate-500 hover:text-blue-600 transition-colors">
          {t("client")} <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }: any) => <div className="font-bold text-slate-800 uppercase text-xs">{row.getValue("client")}</div>,
    },
    {
      accessorKey: "status",
      header: () => <div className="font-black uppercase tracking-widest text-[10px] text-slate-500">{t("status")}</div>,
      cell: ({ row }: any) => {
        const status = row.getValue("status") as string
        const invoiceId = row.original.invoice_id

        // Surface derived overdue (billed + past due) without a manual mark.
        const effective = deriveStatus(row.original)
        const currentStatus = getStatusDef(effective)
        const Icon = currentStatus.icon

        const handleStatusChange = async (newStatus: string) => {
          try {
            await fetch(`/api/mos?endpoint=invoices/${invoiceId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            })
            // Automation: moving to "invoice" emails the PDF to the client (dry-run until Resend is configured).
            if (newStatus === 'invoice') {
              try {
                const r = await fetch(`/api/invoices/${invoiceId}/send`, { method: 'POST' })
                const j = await r.json().catch(() => ({}))
                if (j?.dryRun) toast.info(`Borrador de Invoice generado (no enviado) → ${j.to || 'sin email'}`)
                else if (j?.sent) toast.success(`Invoice enviada a ${j.to}`)
                else if (j?.skipped) toast.message('Invoice ya se había enviado antes')
                else if (j?.error === 'no_recipient') toast.warning('El cliente no tiene email: no se envió')
                else if (j?.error) toast.error(`No se pudo enviar: ${j.error}`)
              } catch { /* non-blocking */ }
            }
            mutate()
          } catch (err) {
            console.error(err)
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("h-auto p-0 hover:bg-transparent group")}>
                <Badge variant="outline" className={cn(
                  currentStatus.badge,
                  "uppercase text-[9px] font-black px-2 py-1 flex items-center gap-1.5 w-fit border rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
                )}>
                  <Icon className="h-3 w-3" />
                  {currentStatus.label[language]}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white border-slate-200 shadow-xl min-w-[180px] p-1">
              {INVOICE_STATUSES.map((opt) => {
                const isCurrent = opt.id === currentStatus.id
                const allowed = isCurrent || canTransition(effective, opt.id)
                return (
                  <DropdownMenuItem
                    key={opt.id}
                    disabled={!allowed}
                    onClick={() => allowed && !isCurrent && handleStatusChange(opt.id)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md transition-colors",
                      allowed ? "cursor-pointer hover:bg-slate-50" : "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", opt.dot)} />
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">{opt.label[language]}</span>
                    {isCurrent && <CheckCircle2 className="h-3 w-3 ml-auto text-emerald-500" />}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: "amounts.total",
      header: () => <div className="font-black uppercase tracking-widest text-[10px] text-slate-500 text-right">Amount</div>,
      cell: ({ row }: any) => {
        const amount = row.original.amounts?.total || 0
        return <div className="font-black text-slate-900 text-right text-sm">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      },
    },
    {
      accessorKey: "dates.due",
      header: () => <div className="font-black uppercase tracking-widest text-[10px] text-slate-500 text-right">Due Date</div>,
      cell: ({ row }: any) => (
        <div className="text-slate-500 text-[11px] text-right font-bold uppercase tracking-tight">{row.original.dates?.due}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const invoice = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all rounded-full">
                  <MoreVertical className="h-5 w-5" strokeWidth={2.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700 shadow-xl min-w-[200px]">
                <DropdownMenuItem 
                  onClick={() => handleOpenInvoice(invoice.invoice_id, 'preview', invoice)}
                  className="hover:bg-blue-50 text-blue-600 cursor-pointer flex items-center gap-2 font-black text-[10px] uppercase tracking-widest p-3 border-b border-slate-50"
                >
                  <Eye className="h-4 w-4" /> View Invoice
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleOpenInvoice(invoice.invoice_id, 'preview', invoice)}
                  className="hover:bg-slate-50 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-tight p-3"
                >
                  <Printer className="h-4 w-4 text-slate-400" /> Print Mos-atlas Invoice
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleOpenInvoice(invoice.invoice_id, 'edit', invoice)}
                  className="hover:bg-slate-50 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-tight p-3"
                >
                  <ExternalLink className="h-4 w-4 text-blue-600" /> Edit Order
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-slate-50 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-tight p-3"
                  onClick={() => window.open(`/api/invoices/${invoice.invoice_id}/pdf`, '_blank')}
                >
                  <Download className="h-4 w-4 text-blue-600" /> Download PDF
                </DropdownMenuItem>
                {showDeleted && (
                  <DropdownMenuItem 
                    onClick={() => handleRestore(invoice.invoice_id)}
                    className="hover:bg-emerald-50 text-emerald-600 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-tight p-3 border-b border-slate-50"
                  >
                    <RefreshCw className="h-4 w-4" /> Restore Order
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => handleDelete(invoice.invoice_id)}
                  className="hover:bg-rose-50 text-rose-600 cursor-pointer flex items-center gap-2 font-bold text-xs uppercase tracking-tight p-3"
                >
                  <XCircle className="h-4 w-4" /> {showDeleted ? "Delete Permanently" : "Delete Order"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ], [showDeleted, t, mutate])

  // Filter options derived from the data actually present.
  const clientOptions = useMemo(
    () => Array.from(new Set((invoices || []).map((i: any) => i.client).filter(Boolean))).sort(),
    [invoices],
  )
  const companyOptions = useMemo(
    () => Array.from(new Set((invoices || []).map((i: any) => i.branding).filter(Boolean))).sort(),
    [invoices],
  )

  const activeFilterCount = [
    statusFilter !== "all",
    clientFilter !== "all",
    companyFilter !== "all",
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length

  const clearFilters = () => {
    setStatusFilter("all"); setClientFilter("all"); setCompanyFilter("all")
    setDateFrom(""); setDateTo("")
  }

  const tableData = useMemo(() => {
    let rows = scopedInvoices
    if (statusFilter !== "all") rows = rows.filter((i: any) => deriveStatus(i) === statusFilter)
    if (clientFilter !== "all") rows = rows.filter((i: any) => i.client === clientFilter)
    if (companyFilter !== "all") rows = rows.filter((i: any) => (i.branding || "") === companyFilter)
    if (dateFrom || dateTo) {
      const range = {
        from: dateFrom ? new Date(`${dateFrom}T00:00:00`) : null,
        to: dateTo ? new Date(`${dateTo}T23:59:59`) : null,
      }
      rows = rows.filter((i: any) => inRange(i.dates?.created, range))
    }
    return rows
  }, [scopedInvoices, statusFilter, clientFilter, companyFilter, dateFrom, dateTo])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })


  const totals = scopedInvoices?.reduce((acc: any, inv: any) => ({
    count: acc.count + 1,
    amount: acc.amount + (inv.amounts?.total || 0)
  }), { count: 0, amount: 0 })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-1">
      {/* Header with quick stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-12 bg-[#0091D5] rounded-full shadow-[0_0_20px_rgba(0,145,213,0.4)]" />
             <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase italic leading-none">
                {scopeCfg.title[language]}
             </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 opacity-70">
            Prosper Manufacturing &bull; Enterprise Resource Invoicing
          </p>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
               <div className="flex items-center">
                   <div className="w-2 h-24 bg-[#0091D5] shadow-[0_0_20px_rgba(0,145,213,0.2)]" />
                  <div className="p-8 flex items-center gap-6 w-full">
                     <div className="w-14 h-14 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-[#0091D5] group-hover:scale-110 transition-transform shadow-inner">
                        <Briefcase className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Pipeline</p>
                        <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{totals?.count || 0} Documents</p>
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
                     <div className="w-14 h-14 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-inner">
                        <DollarSign className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Valuation</p>
                        <p className="text-3xl font-black text-[#0F172A] tracking-tighter">${totals?.amount?.toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
               <div className="flex items-center">
                  <div className="w-1.5 h-24 bg-amber-400" />
                  <div className="p-6 flex items-center gap-5 w-full">
                     <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                        <Clock className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Synchronization</p>
                        <p className="text-2xl font-black text-slate-900">Live Connect</p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID, Client or PO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 bg-white border-slate-200 text-slate-900 h-12 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all border-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreating(true)}
              className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-[#0091D5] text-white hover:bg-[#0077b0] transition-all shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> {scopeCfg.createLabel[language]}
            </Button>
            <Button
              variant={showDeleted ? "destructive" : "outline"}
              onClick={() => setShowDeleted(!showDeleted)}
              className={cn(
                "h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                showDeleted ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <Trash2 className="mr-2 h-4 w-4" /> 
              {showDeleted ? "Viewing Trash" : "Trash"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters((s) => !s)}
              className={cn(
                "h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                showFilters || activeFilterCount > 0
                  ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <Filter className="mr-2 h-4 w-4" /> {language === "es" ? "Filtros" : "Filters"}
              {activeFilterCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="px-6 py-5 border-b border-slate-100 bg-white animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("status")}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold uppercase text-slate-700 focus:outline-none focus:border-blue-400"
                >
                  <option value="all">{language === "es" ? "Todos" : "All"}</option>
                  {INVOICE_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label[language]}</option>
                  ))}
                </select>
              </div>
              {/* Client */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("client")}</label>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold uppercase text-slate-700 focus:outline-none focus:border-blue-400"
                >
                  <option value="all">{language === "es" ? "Todos" : "All"}</option>
                  {clientOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Company */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === "es" ? "Compañía" : "Company"}</label>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold uppercase text-slate-700 focus:outline-none focus:border-blue-400 disabled:opacity-40"
                  disabled={companyOptions.length === 0}
                >
                  <option value="all">{language === "es" ? "Todas" : "All"}</option>
                  {companyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Date From (Invoice Date) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === "es" ? "Desde" : "From"}</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="h-11 bg-white border-2 border-slate-200 text-xs font-bold rounded-xl focus:border-blue-400" />
              </div>
              {/* Date To */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language === "es" ? "Hasta" : "To"}</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="h-11 bg-white border-2 border-slate-200 text-xs font-bold rounded-xl focus:border-blue-400" />
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {tableData.length} {language === "es" ? "resultados" : "results"}
                </span>
                <Button variant="ghost" onClick={clearFilters}
                  className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-lg">
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> {language === "es" ? "Limpiar" : "Clear"}
                </Button>
              </div>
            )}
          </div>
        )}

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
                  <td colSpan={columns.length} className="h-48 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <FileText className="h-10 w-10 text-slate-200" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active documents found</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Creation/Edit Modal */}
      <Dialog open={!!isCreating} onOpenChange={() => setIsCreating(false)}>
        <DialogContent aria-describedby={undefined} className="max-w-[100vw] w-screen h-screen max-h-screen overflow-y-auto bg-white border-0 p-0 shadow-none rounded-none translate-x-0 translate-y-0 left-0 top-0 sm:rounded-none">
          <DialogTitle className="sr-only">Mos-atlas Order Entry</DialogTitle>
          <InvoiceForm 
            initialData={typeof isCreating === 'object' ? isCreating : undefined}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-[98vw] w-full h-[98vh] max-h-[98vh] overflow-y-auto bg-slate-50 border-slate-200 p-0 shadow-2xl rounded-2xl flex flex-col">
          <DialogTitle className="sr-only">Mos-atlas Invoice Preview</DialogTitle>
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Printer className="h-5 w-5" />
               </div>
                <div>
                  <h2 className="text-slate-900 font-black uppercase tracking-tight text-sm">Prosper Manufacturing Format</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {previewShowFinancials ? "Billing / Facturación Mode" : "Production / Piso Mode"}
                  </p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setPreviewShowFinancials(false)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                      !previewShowFinancials ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Producción
                  </button>
                  <button 
                    onClick={() => setPreviewShowFinancials(true)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                      previewShowFinancials ? "bg-white text-[#0091D5] shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Facturación
                  </button>
                </div>
              <Button onClick={handlePrint} className="bg-[#0091D5] hover:bg-[#0081C0] text-white font-black uppercase text-[10px] px-10 h-12 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2">
                <Printer className="h-4 w-4" /> Final Print Document
              </Button>
              <Button variant="ghost" onClick={() => setPreviewInvoice(null)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 h-12 w-12 p-0 rounded-2xl transition-all">
                <XCircle className="h-7 w-7" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 bg-slate-200/50 overflow-y-auto flex justify-center">
            <div className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-slate-200 transform scale-100 origin-top overflow-hidden rounded-sm h-fit">
              {previewInvoice && <MosAtlasInvoice invoice={previewInvoice} showFinancials={previewShowFinancials} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function InvoicesPage() {
  return <InvoicesWorkspace scope="invoices" />
}
