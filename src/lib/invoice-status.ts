/**
 * Invoice / Quote lifecycle — SINGLE SOURCE OF TRUTH.
 *
 * The whole feature (lists, status badges, dashboard metrics, filters,
 * email automation) reads statuses from here. Do NOT redefine status
 * arrays anywhere else — import from this module instead.
 *
 * The state machine:
 *   quote → scheduled → to_final_bill → invoice → paid
 *                                          └→ overdue → paid
 *   (cancelled is reachable from any active state)
 *
 * Persistence note: MOS stores `invoice.status` as a free string, so these
 * canonical ids are written straight through the proxy (PUT invoices/:id).
 * Older records may still carry legacy ids (draft/sent/artwork_pending) —
 * `normalizeStatus()` maps them onto the canonical set for display/logic.
 */

import {
  FileText,
  CalendarClock,
  Receipt,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  type LucideIcon,
} from "lucide-react"

export type InvoiceStatus =
  | "quote"
  | "scheduled"
  | "to_final_bill"
  | "invoice"
  | "paid"
  | "overdue"
  | "cancelled"

export interface InvoiceStatusDef {
  id: InvoiceStatus
  /** Display labels per language. */
  label: { en: string; es: string }
  /** Tailwind classes for a soft badge (bg + text + border). */
  badge: string
  /** Tailwind bg class for a solid dot/pill. */
  dot: string
  icon: LucideIcon
}

/** Ordered by lifecycle — drives dropdowns, columns and dashboard order. */
export const INVOICE_STATUSES: InvoiceStatusDef[] = [
  {
    id: "quote",
    label: { en: "Quote", es: "Cotización" },
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    icon: FileText,
  },
  {
    id: "scheduled",
    label: { en: "Scheduled", es: "Programado" },
    badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
    dot: "bg-indigo-500",
    icon: CalendarClock,
  },
  {
    id: "to_final_bill",
    label: { en: "To Final Bill", es: "Para Cierre" },
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-500",
    icon: FileCheck2,
  },
  {
    id: "invoice",
    label: { en: "Invoice", es: "Facturado" },
    badge: "bg-blue-50 text-blue-600 border-blue-100",
    dot: "bg-blue-500",
    icon: Receipt,
  },
  {
    id: "paid",
    label: { en: "Paid", es: "Pagado" },
    badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  {
    id: "overdue",
    label: { en: "Overdue", es: "Vencido" },
    badge: "bg-rose-50 text-rose-600 border-rose-100",
    dot: "bg-rose-500",
    icon: AlertTriangle,
  },
  {
    id: "cancelled",
    label: { en: "Cancelled", es: "Cancelado" },
    badge: "bg-red-50 text-red-500 border-red-100",
    dot: "bg-red-400",
    icon: XCircle,
  },
]

const BY_ID: Record<InvoiceStatus, InvoiceStatusDef> = INVOICE_STATUSES.reduce(
  (acc, s) => {
    acc[s.id] = s
    return acc
  },
  {} as Record<InvoiceStatus, InvoiceStatusDef>,
)

/** Legacy / external status ids → canonical lifecycle ids. */
const LEGACY_STATUS_MAP: Record<string, InvoiceStatus> = {
  draft: "quote",
  sent: "invoice",
  invoiced: "invoice",
  artwork_pending: "scheduled",
  // Printavo / final-bill wording that may arrive from upstream:
  "final bill": "to_final_bill",
  final_bill: "to_final_bill",
  ready: "to_final_bill",
}

/** Map any raw status string onto a canonical lifecycle id. */
export function normalizeStatus(raw?: string | null): InvoiceStatus {
  if (!raw) return "quote"
  const key = String(raw).trim().toLowerCase()
  if (key in BY_ID) return key as InvoiceStatus
  if (key in LEGACY_STATUS_MAP) return LEGACY_STATUS_MAP[key]
  return "quote"
}

export function getStatusDef(raw?: string | null): InvoiceStatusDef {
  return BY_ID[normalizeStatus(raw)]
}

export function statusLabel(raw?: string | null, lang: "en" | "es" = "es"): string {
  return getStatusDef(raw).label[lang]
}

// ── Transitions ───────────────────────────────────────────────────────────────
// Forward happy-path plus a few pragmatic step-backs. `cancelled` is reachable
// from any active state; a cancelled doc can be reopened as a quote.

const TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  quote: ["scheduled", "cancelled"],
  scheduled: ["to_final_bill", "quote", "cancelled"],
  to_final_bill: ["invoice", "scheduled", "cancelled"],
  invoice: ["paid", "overdue", "cancelled"],
  overdue: ["paid", "cancelled"],
  paid: ["invoice"], // allow correcting a mis-marked payment
  cancelled: ["quote"],
}

/** Statuses you can legally move to from `from` (excludes itself). */
export function nextStatuses(from?: string | null): InvoiceStatus[] {
  return TRANSITIONS[normalizeStatus(from)] ?? []
}

export function canTransition(from?: string | null, to?: string | null): boolean {
  const target = normalizeStatus(to)
  return nextStatuses(from).includes(target)
}

// ── Overdue derivation ─────────────────────────────────────────────────────────

/** Parse "Net 7" / "NET30" / "15" → number of days (default 7). */
export function parseTermsDays(terms?: string | null): number {
  if (!terms) return 7
  const m = String(terms).match(/\d+/)
  return m ? parseInt(m[0], 10) : 7
}

interface OverdueInput {
  status?: string | null
  dates?: { created?: string; due?: string } | null
  terms?: string | null
}

/** Compute the effective due date (uses dates.due, else created + terms). */
export function effectiveDueDate(inv: OverdueInput): Date | null {
  const due = inv.dates?.due
  if (due) {
    const d = new Date(due)
    if (!isNaN(d.getTime())) return d
  }
  const created = inv.dates?.created
  if (created) {
    const c = new Date(created)
    if (!isNaN(c.getTime())) {
      c.setDate(c.getDate() + parseTermsDays(inv.terms))
      return c
    }
  }
  return null
}

/**
 * Derive the display status: a billed ("invoice") doc whose due date has
 * passed is surfaced as "overdue" even if not explicitly marked.
 * `now` is injectable for testing/SSR determinism.
 */
export function deriveStatus(inv: OverdueInput, now: Date = new Date()): InvoiceStatus {
  const base = normalizeStatus(inv.status)
  if (base === "invoice") {
    const due = effectiveDueDate(inv)
    if (due && due.getTime() < now.getTime()) return "overdue"
  }
  return base
}
