"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Invoice } from "@/lib/api"
import { MosAtlasInvoice } from "@/components/dashboard/invoices/MosAtlasInvoice"

type ErrorState = { status: number; detail: string } | null

export default function PublicProductionPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorState>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    // The backend's /api/invoices/public/{id} requires a `token` query param
    // (it's the invoice's access_token issued at creation). Without it we get
    // 403 and the UI rendered an empty invoice template — looking like the
    // "captured data is gone" bug. Forward whatever is on the URL.
    const url = token
      ? `/api/mos?endpoint=invoices/public/${id}&token=${encodeURIComponent(token)}`
      : `/api/mos?endpoint=invoices/public/${id}`

    fetch(url)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError({ status: res.status, detail: body?.error || body?.detail || `HTTP ${res.status}` })
          setInvoice(null)
          return
        }
        // Sanity check: a real invoice has invoice_id. If the backend returned
        // an error shape ({error: "..."}) but with status 200 (proxy quirks),
        // treat as a failure instead of rendering an empty template.
        if (!body || !body.invoice_id) {
          setError({
            status: 200,
            detail: body?.error || "La respuesta del servidor no incluyó datos de la orden.",
          })
          setInvoice(null)
          return
        }
        setInvoice(body)
      })
      .catch((err) => {
        setError({ status: 0, detail: err?.message || "Network error" })
      })
      .finally(() => setLoading(false))
  }, [id, token])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Production Sheet...</p>
      </div>
    </div>
  )

  if (error || !invoice) {
    const status = error?.status
    const isAuth = status === 403 || (!token && status !== 404)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-8 space-y-4 text-center">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-black text-xl">
            !
          </div>
          <h1 className="text-lg font-black uppercase tracking-widest text-slate-800">
            {status === 404 ? "Orden no encontrada" : isAuth ? "Acceso restringido" : "Error al cargar la orden"}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {status === 404
              ? `No existe una orden con ID ${id}.`
              : isAuth
              ? "Esta vista pública requiere un token de acceso. Vuelve a abrir el enlace que se generó desde la orden — debe terminar en ?token=…"
              : error?.detail || "Hubo un problema cargando los datos."}
          </p>
          {error?.detail && status !== 404 && !isAuth && (
            <p className="text-[10px] font-mono text-slate-400 break-all bg-slate-50 border border-slate-100 rounded p-2">
              {error.detail}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 print:p-0 print:bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <span className="text-sm">🖨️</span> Imprimir Orden
          </button>
        </div>
        <div className="bg-white shadow-xl print:shadow-none border border-slate-200 print:border-none">
          <MosAtlasInvoice invoice={invoice} showFinancials={false} />
        </div>
      </div>
    </div>
  )
}
