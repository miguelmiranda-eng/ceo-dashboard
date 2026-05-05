"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Invoice } from "@/lib/api"
import { ProductionSheet } from "@/components/dashboard/production/ProductionSheet"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

export default function PublicProductionPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Usamos el nuevo endpoint público para evitar problemas de autenticación en la vista de planta
    // Usamos el proxy interno para evitar problemas de CORS y URLs locales
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

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#0B1120] text-white">Loading Production Sheet...</div>
  if (!invoice) return <div className="flex items-center justify-center min-h-screen bg-[#0B1120] text-white">Order not found</div>

  return (
    <div className="min-h-screen bg-[#0B1120] py-12 px-4 scroll-smooth">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex justify-between items-center no-print bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3">
             <div className="w-2 h-8 bg-blue-500 rounded-full" />
             <h2 className="text-white font-black uppercase tracking-widest text-sm italic">Prosper Production Console</h2>
          </div>
          <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Printer className="mr-2 h-4 w-4" /> Print Production Sheet
          </Button>
        </div>
        <div className="bg-white shadow-none rounded-none overflow-hidden">
          <ProductionSheet invoice={invoice} />
        </div>
      </div>
    </div>
  )
}
