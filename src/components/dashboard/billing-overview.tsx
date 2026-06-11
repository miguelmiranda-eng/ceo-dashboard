"use client"

/**
 * Executive billing dashboard — the 6 headline metrics.
 * Everything is derived from the canonical invoice status (src/lib/invoice-status.ts);
 * the "Paid" metric is windowed by the active date filter (Invoice Date anchored).
 */

import useSWR from "swr"
import {
  FileText,
  CalendarClock,
  FileCheck2,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"
import { fetchInvoices, type Invoice } from "@/lib/api"
import { deriveStatus } from "@/lib/invoice-status"
import { resolveDateRange, inRange } from "@/lib/date-range"
import { useDashboardFilters } from "@/lib/filter-context"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const COPY = {
  es: {
    heading: "Resumen Ejecutivo de Facturación",
    sub: "Cotizaciones · Schedule · Cierre · Cobros",
    quotes: "Quotes Abiertas",
    scheduled: "Órdenes en Schedule",
    finalBill: "Para Final Bill",
    pending: "Invoices Pendientes",
    paid: "Pagado (rango)",
    overdue: "Pagos Vencidos",
    pos: "POs",
    pcs: "pzs",
    error: "No se pudieron cargar las facturas",
  },
  en: {
    heading: "Executive Billing Overview",
    sub: "Quotes · Schedule · Closing · Payments",
    quotes: "Open Quotes",
    scheduled: "Scheduled Orders",
    finalBill: "To Final Bill",
    pending: "Pending Invoices",
    paid: "Paid (range)",
    overdue: "Overdue Payments",
    pos: "POs",
    pcs: "pcs",
    error: "Failed to load invoices",
  },
}

type Color = "sky" | "indigo" | "orange" | "primary" | "emerald" | "red"

const COLOR_MAP: Record<Color, string> = {
  sky: "text-sky-500 border-sky-500/20 bg-sky-500/10",
  indigo: "text-indigo-500 border-indigo-500/20 bg-indigo-500/10",
  orange: "text-orange-500 border-orange-500/20 bg-orange-500/10",
  primary: "text-blue-600 border-blue-500/20 bg-blue-500/10",
  emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
  red: "text-rose-500 border-rose-500/20 bg-rose-500/10",
}

function pieces(inv: Invoice): number {
  return (inv.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
}

function amount(inv: Invoice): number {
  return Number(inv.amounts?.total) || 0
}

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`

interface Metric {
  key: string
  title: string
  value: number
  badge: string
  icon: LucideIcon
  color: Color
}

function BillingCard({ m }: { m: Metric }) {
  const Icon = m.icon
  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-5">
          <div className={cn("h-10 w-10 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105", COLOR_MAP[m.color])}>
            <Icon className="h-5 w-5" />
          </div>
          {m.badge && (
            <div className="py-1 px-3 rounded-full bg-muted border border-border shadow-sm">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.05em]">{m.badge}</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">{m.title}</h3>
          <div className="text-3xl font-bold text-foreground tracking-tight">{m.value.toLocaleString()}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BillingOverview() {
  const { language } = useI18n()
  const { filters } = useDashboardFilters()
  const c = COPY[language]

  const { data: invoices, error, isLoading } = useSWR<Invoice[]>(
    "billing-invoices",
    () => fetchInvoices(),
    { revalidateOnFocus: false },
  )

  const range = resolveDateRange(filters)

  const metrics: Metric[] = (() => {
    const list = invoices || []
    const by = (status: string) => list.filter((inv) => deriveStatus(inv) === status)

    const quotes = by("quote")
    const scheduled = by("scheduled")
    const finalBill = by("to_final_bill")
    const pending = by("invoice")
    const overdue = by("overdue")
    const paid = by("paid").filter((inv) => inRange(inv.dates?.created, range))

    const sumAmt = (arr: Invoice[]) => arr.reduce((s, i) => s + amount(i), 0)
    const sumPcs = (arr: Invoice[]) => arr.reduce((s, i) => s + pieces(i), 0)

    return [
      { key: "quotes", title: c.quotes, value: quotes.length, badge: money(sumAmt(quotes)), icon: FileText, color: "sky" },
      { key: "scheduled", title: c.scheduled, value: scheduled.length, badge: `${sumPcs(scheduled).toLocaleString()} ${c.pcs}`, icon: CalendarClock, color: "indigo" },
      { key: "finalBill", title: c.finalBill, value: finalBill.length, badge: money(sumAmt(finalBill)), icon: FileCheck2, color: "orange" },
      { key: "pending", title: c.pending, value: pending.length, badge: money(sumAmt(pending)), icon: Receipt, color: "primary" },
      { key: "paid", title: c.paid, value: paid.length, badge: money(sumAmt(paid)), icon: CheckCircle2, color: "emerald" },
      { key: "overdue", title: c.overdue, value: overdue.length, badge: money(sumAmt(overdue)), icon: AlertTriangle, color: "red" },
    ]
  })()

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-[#0091D5] rounded-full" />
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{c.heading}</h2>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{c.sub}</p>
        </div>
      </div>

      {error ? (
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-5 text-sm font-semibold text-rose-600">{c.error}</CardContent>
        </Card>
      ) : (
        <div className={cn("grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4", isLoading && "opacity-50 animate-pulse")}>
          {metrics.map((m) => <BillingCard key={m.key} m={m} />)}
        </div>
      )}
    </section>
  )
}
