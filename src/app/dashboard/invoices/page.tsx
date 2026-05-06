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
import { ProsperInvoice } from "@/components/dashboard/invoices/ProsperInvoice"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"

export default function InvoicesPage() {
  const { t } = useI18n()
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [isCreating, setIsCreating] = useState<any>(false)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [showDeleted, setShowDeleted] = useState(false)

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

  const handleCreate = async (data: Partial<Invoice>) => {
    try {
      if (data.invoice_id) {
        await updateInvoice(data.invoice_id, data)
      } else {
        await createInvoice(data)
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
          Client <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }: any) => <div className="font-bold text-slate-800 uppercase text-xs">{row.getValue("client")}</div>,
    },
    {
      accessorKey: "status",
      header: () => <div className="font-black uppercase tracking-widest text-[10px] text-slate-500">Status</div>,
      cell: ({ row }: any) => {
        const status = row.getValue("status") as string
        const invoiceId = row.original.invoice_id
        
        const STATUS_OPTIONS = [
          { id: 'draft', label: 'Quote', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: FileText },
          { id: 'sent', label: 'Invoiced', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Clock },
          { id: 'artwork_pending', label: 'Art Pending', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertCircle },
          { id: 'paid', label: 'Paid / Ready', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
          { id: 'overdue', label: 'Overdue', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: AlertCircle },
          { id: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-500 border-red-100', icon: XCircle },
        ]

        const currentStatus = STATUS_OPTIONS.find(s => s.id === status) || STATUS_OPTIONS[0]
        const Icon = currentStatus.icon

        const handleStatusChange = async (newStatus: string) => {
          try {
            await fetch(`/api/mos?endpoint=invoices/${invoiceId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            })
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
                  currentStatus.color, 
                  "uppercase text-[9px] font-black px-2 py-1 flex items-center gap-1.5 w-fit border rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
                )}>
                  <Icon className="h-3 w-3" />
                  {currentStatus.label}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white border-slate-200 shadow-xl min-w-[160px] p-1">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem 
                  key={opt.id}
                  onClick={() => handleStatusChange(opt.id)}
                  className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50 rounded-md transition-colors"
                >
                  <div className={cn("w-2 h-2 rounded-full", opt.color.split(' ')[0])} />
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">{opt.label}</span>
                </DropdownMenuItem>
              ))}
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
                  <Printer className="h-4 w-4 text-slate-400" /> Print Prosper Invoice
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

  const tableData = useMemo(() => invoices || [], [invoices])

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


  const totals = invoices?.reduce((acc: any, inv: any) => ({
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
                {t("invoices")}
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
            <Button variant="outline" className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest">
              <Filter className="mr-2 h-4 w-4" /> Advanced Filters
            </Button>
          </div>
        </div>

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
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto bg-white border-slate-200 p-0 shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">Prosper Order Entry</DialogTitle>
          <InvoiceForm 
            initialData={typeof isCreating === 'object' ? isCreating : undefined}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto bg-slate-50 border-slate-200 p-0 shadow-2xl rounded-2xl">
          <DialogTitle className="sr-only">Prosper Invoice Preview</DialogTitle>
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Printer className="h-5 w-5" />
               </div>
               <div>
                  <h2 className="text-slate-900 font-black uppercase tracking-tight text-sm">Prosper Manufacturing Format</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Document Preview</p>
               </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handlePrint} className="bg-[#0091D5] hover:bg-[#0081C0] text-white font-black uppercase text-[10px] px-10 h-12 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2">
                <Printer className="h-4 w-4" /> Final Print Document
              </Button>
              <Button variant="ghost" onClick={() => setPreviewInvoice(null)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 h-12 w-12 p-0 rounded-2xl transition-all">
                <XCircle className="h-7 w-7" />
              </Button>
            </div>
          </div>
          <div className="p-12">
            <div className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-slate-200 transform scale-[0.98] origin-top overflow-hidden rounded-sm">
              {previewInvoice && <ProsperInvoice invoice={previewInvoice} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
