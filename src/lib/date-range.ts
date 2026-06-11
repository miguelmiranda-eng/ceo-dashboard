/**
 * Resolve a dashboard filter preset into a concrete [from, to] window.
 * Invoice Date is the anchor for every date range in the billing dashboard.
 */
import type { DashboardFilters } from "@/lib/api"

export interface DateRange {
  from: Date | null
  to: Date | null
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/**
 * `now` is injectable for deterministic tests/SSR.
 * Returns {from: null, to: null} for the "all" preset (no bound).
 */
export function resolveDateRange(filters: DashboardFilters, now: Date = new Date()): DateRange {
  const preset = filters.preset || "week"

  // Explicit dates always win when present (custom range from a filter bar).
  if (filters.date_from || filters.date_to) {
    return {
      from: filters.date_from ? startOfDay(new Date(filters.date_from)) : null,
      to: filters.date_to ? endOfDay(new Date(filters.date_to)) : null,
    }
  }

  switch (preset) {
    case "all":
      return { from: null, to: null }
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) }
    case "yesterday": {
      const y = new Date(now)
      y.setDate(now.getDate() - 1)
      return { from: startOfDay(y), to: endOfDay(y) }
    }
    case "week": {
      const day = now.getDay() || 7 // Mon=1 … Sun=7
      const mon = new Date(now)
      mon.setDate(now.getDate() - day + 1)
      const sun = new Date(mon)
      sun.setDate(mon.getDate() + 6)
      return { from: startOfDay(mon), to: endOfDay(sun) }
    }
    case "month":
    case "month_year":
    default: {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { from: startOfDay(from), to: endOfDay(to) }
    }
  }
}

/** True if `dateStr` (YYYY-MM-DD or ISO) falls inside the range (null bounds = open). */
export function inRange(dateStr: string | undefined | null, range: DateRange): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  if (range.from && d.getTime() < range.from.getTime()) return false
  if (range.to && d.getTime() > range.to.getTime()) return false
  return true
}
