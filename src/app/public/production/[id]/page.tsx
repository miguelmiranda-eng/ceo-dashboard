"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Invoice } from "@/lib/api"
import { ProsperInvoice } from "@/components/dashboard/invoices/ProsperInvoice"

export default function PublicProductionPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/mos?endpoint=/api/invoices/public/${id}`)
      .then(res => res.json())
      .then(data => {
        setInvoice(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Production Sheet...</p>
      </div>
    </div>
  )

  if (!invoice) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-sm">
      Order not found
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white shadow-sm">
          <ProsperInvoice invoice={invoice} showFinancials={false} />
        </div>
      </div>
    </div>
  )
}
