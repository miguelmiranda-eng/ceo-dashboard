"use client"

import { useParams } from "next/navigation"
import useSWR from "swr"
import { fetchInvoice } from "@/lib/api"
import { ProsperInvoice } from "@/components/dashboard/invoices/ProsperInvoice"
import { Loader2 } from "lucide-react"

export default function PublicInvoicePage() {
  const params = useParams()
  const id = params.id as string

  const { data: invoice, error } = useSWR(id ? ['public-invoice', id] : null, () => fetchInvoice(id))

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Error 404</h1>
        <p className="text-slate-500">No se pudo encontrar la información de esta orden.</p>
      </div>
    </div>
  )

  if (!invoice) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="print:p-0">
        <ProsperInvoice invoice={invoice} />
      </div>
      <div className="text-center mt-8 no-print pb-12">
        <p className="text-xs text-slate-400">Prosper Manufacturing - Production View</p>
      </div>
    </div>
  )
}
