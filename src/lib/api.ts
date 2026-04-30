// ─── Types ────────────────────────────────────────────────────────────────────

export interface Metric {
  value: number
  delta: number
  remaining: number
}

export interface Machine {
  id: string
  name: string
  /** Percentage load 0-100 */
  capacity: number
  status: 'active' | 'inactive'
  /** Estimated days to clear queue (from capacity-plan) */
  estimatedDays?: number
  /** Load status from backend: idle | green | yellow | red */
  loadStatus?: string
  /** Pieces remaining in queue */
  remainingPieces?: number
  /** Average daily production capacity */
  avgDaily?: number
  /** Average setup time in minutes */
  avgSetup?: number
  /** Active order numbers (POs) */
  activeOrders?: string[]
}

export interface DashboardData {
  production: {
    daily: Metric
    weekly: Metric
    monthly: Metric
    annual: Metric
  }
  /** Efficiency trend for the current week (daily produced units) */
  efficiencyTrends: { date: string; value: number }[]
  machinery: {
    active: number
    inactive: number
    machines: Machine[]
  }
  /** Global efficiency % from the weekly period */
  efficiency: number
  /** Average setup time in minutes across all active machines */
  avgSetup: number
  /** Total pieces remaining in the entire system */
  totalRemainingPieces: number
  /** Top clients this month */
  topClients: { client: string; produced: number }[]
  /** Top machines by production this week */
  topMachines: { machine: string; produced: number; avg_setup: number }[]
  /** Total value of orders currently on machines */
  revenueOnMachines: number
  /** Total value of orders finished today */
  generatedRevenueToday: number
}

export interface InvoiceItem {
  description: string
  quantity: number
  price: number
  amount: number
  sizes?: Record<string, number>
}

export interface Invoice {
  invoice_id: string
  order_number?: string
  type: 'quote' | 'invoice'
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  client: string
  customer_po?: string
  dates: { created: string; due: string }
  terms: string
  amounts: { subtotal: number; tax: number; total: number }
  billing_address: any
  shipping_address: any
  items: InvoiceItem[]
  payment: { status: string; stripe_payment_intent_id?: string }
  approval_status: 'pending' | 'approved' | 'rejected'
  linked_work_orders: string[]
  store_po?: string
  design_num?: string
  job_title_a?: { url: string; desc: string }
  cancel_date?: string
  sample?: string
  style?: string
  branding?: string
  priority?: string
  blank_status?: string
  artwork_status?: string
  color?: string
  production_notes?: string
  seps?: string
  art_links?: string[]
  created_at: string
  updated_at: string
}

export interface WorkOrder {
  work_order_id: string
  source_invoice_id: string
  production_status: 'artwork_pending' | 'artwork_approved' | 'production' | 'quality_check' | 'completed'
  art_links: string[]
  production_notes?: string
  packing_details: { bags: string; labels: string; boxes: string }
  assigned_operator?: string
  scheduled_date?: string
  completion_date?: string
  created_at: string
  updated_at: string
}

export interface DashboardFilters {
  preset?: string
  date_from?: string
  date_to?: string
  lang?: string
  origin?: string
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Call our server-side MOS proxy route. Works in both client and server contexts. */
async function mosProxy(endpoint: string, params: Record<string, string> = {}, origin?: string): Promise<unknown> {
  let base = 'http://localhost:3000'
  if (typeof window !== 'undefined') {
    base = window.location.origin
  } else if (origin) {
    base = origin
  } else if (process.env.VERCEL_URL) {
    base = `https://${process.env.VERCEL_URL}`
  }
  
  const url = new URL('/api/mos', base)
  url.searchParams.set('endpoint', endpoint)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `MOS API ${res.status}`)
  }
  return res.json()
}

/** Extract a safe number from an unknown value */
function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return isNaN(n) ? fallback : n
}

/**
 * Calculates percentage delta between two values:
 * delta = ((current - previous) / previous) * 100
 */
function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

// ─── Main fetch function ───────────────────────────────────────────────────────

export async function fetchDashboardData(filters: DashboardFilters = {}): Promise<DashboardData> {
  const origin = filters.origin
  // Fetch all datasets in parallel for performance
    // Fetch all datasets in parallel for performance
  const [analyticsToday, analyticsWeek, analyticsMonth, capacityPlan, printavoData] =
    await Promise.all([
      mosProxy('production-analytics', { preset: 'today' }, origin),
      mosProxy('production-analytics', { preset: filters.preset || 'week', ...filters as any }, origin),
      mosProxy('production-analytics', { preset: 'month' }, origin),
      mosProxy('capacity-plan', {}, origin),
      fetch(`${filters.origin || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/api/printavo`, { cache: 'no-store' })
    ])

  // ── Printavo Enrichment ────────────────────────────────────────────────────
  const printavoRes = printavoData as Response
  const printavo = printavoRes.ok ? await printavoRes.json() : { matched_revenue: 0, generated_revenue_today: 0 }

  // ── Type-cast raw responses ────────────────────────────────────────────────
  const today = analyticsToday as Record<string, unknown>
  const week = analyticsWeek as Record<string, unknown>
  const month = analyticsMonth as Record<string, unknown>
  const capacity = capacityPlan as {
    machines: Array<{
      machine: string
      order_count: number
      avg_daily_production: number
      estimated_days: number
      load_status: string
      remaining_pieces: number
    }>
    total_completed: number
    in_production: number
    total_pieces_system: number
  }

  // ── Production metrics ─────────────────────────────────────────────────────
  const dailyValue = num(today.total_produced)
  const weeklyValue = num(week.total_produced)
  const monthlyValue = num(month.total_produced)
  const annualValue = monthlyValue * 12 // Estimate annual from monthly to avoid heavy all-time query

  // For deltas, compare today to yesterday average, week to prior week, etc.
  // We approximate using the trend data already available in the analytics response.
  const weekTrend = (week.trend_data as Array<{ label: string; produced: number }>) || []

  // Week delta: compare this week's total to the 7 days before it (not available directly)
  // We use efficiency as a proxy metric for delta comparison
  const weekEfficiency = num(week.efficiency)
  const monthEfficiency = num(month.efficiency)

  // ── Trend chart — dynamic units produced (Today = hours, Week = days) ─────────
  const isToday = filters.preset === 'today'
  
  const efficiencyTrends: { date: string; value: number }[] = weekTrend.map((d) => {
    let label = d.label
    let dateObj = new Date(d.label)
    
    // Fix: If date is invalid but looks like YYYY-MM-DDTHH, try padding to make it valid
    if (isNaN(dateObj.getTime()) && d.label.length === 13 && d.label.includes('T')) {
      dateObj = new Date(d.label + ':00:00')
    }
    
    // Check if the date is valid now
    if (!isNaN(dateObj.getTime())) {
      if (isToday) {
        // Format as only the hour (HH:00)
        const hour = dateObj.getHours().toString().padStart(2, '0')
        label = `${hour}:00`
      } else {
        // Format as weekday for other presets
        label = dateObj.toLocaleDateString(filters.lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'short' })
      }
    } else if (isToday && d.label.includes('T')) {
      // Fallback: manually extract hour if Date parsing fails completely
      const parts = d.label.split('T')
      if (parts[1]) {
        label = `${parts[1].substring(0, 2)}:00`
      }
    }
    
    return {
      date: label,
      value: d.produced,
    }
  })

  // If empty, pad with placeholders based on context
  if (efficiencyTrends.length === 0) {
    if (isToday) {
      const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
      hours.forEach((h) => efficiencyTrends.push({ date: h, value: 0 }))
    } else {
      const esDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      const enDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const days = filters.lang === 'es' ? esDays : enDays
      days.forEach((d) => efficiencyTrends.push({ date: d, value: 0 }))
    }
  }

  // ─── Machinery status from capacity-plan ───────────────────────────────────
  // Create a map for machine-specific analytics (like avg_setup)
  const analyticsByMachineMap = new Map<string, any>()
  const byMachineRaw = (week.by_machine as Array<any>) || []
  byMachineRaw.forEach(m => analyticsByMachineMap.set(m.machine, m))

  const machineList: Machine[] = (capacity.machines || []).map((m) => {
    const isActive = m.order_count > 0                    // has orders in queue
    const isWorking = m.load_status !== 'idle'
    const machineAnalytics = analyticsByMachineMap.get(m.machine) || {}

    // Capacity = percentage based on load status
    // Green: 0-65%, Yellow: 66-85%, Red: 86-100%
    const capacityPct =
      m.load_status === 'idle'
        ? 0
        : m.load_status === 'green'
        ? Math.min(65, Math.round((m.avg_daily_production / 500) * 100) || 30)
        : m.load_status === 'yellow'
        ? 75 // Real load would be better, but we default to a safe yellow zone
        : 95 // Red alert

    // Compute real remaining pieces from orders (total - produced per order)
    const machineOrders = (m as any).orders_in_progress || []
    const realRemaining = machineOrders.reduce((sum: number, o: any) => {
      return sum + Math.max(0, num(o.total) - num(o.produced))
    }, 0)

    return {
      id: m.machine,
      name: m.machine.replace('MAQUINA', 'Machine '),
      capacity: capacityPct,
      status: isActive || isWorking ? 'active' : 'inactive',
      estimatedDays: m.estimated_days,
      loadStatus: m.load_status,
      remainingPieces: realRemaining,
      avgDaily: m.avg_daily_production,
      avgSetup: num(machineAnalytics.avg_setup),
      activeOrders: machineOrders.map((o: any) => o.order_number).filter(Boolean),
    }
  })

  // Calculate global Average Setup Time (only for machines that have setup data)
  const setupTimes = machineList.map(m => m.avgSetup).filter((s): s is number => s !== undefined && s > 0)
  const globalAvgSetup = setupTimes.length > 0 
    ? Math.round((setupTimes.reduce((a, b) => a + b, 0) / setupTimes.length) * 10) / 10
    : 1.2 // Fallback to a realistic baseline if no setups recorded

  const activeMachines = machineList.filter((m) => m.status === 'active').length
  const inactiveMachines = machineList.filter((m) => m.status === 'inactive').length

  // ── Top machines this week ─────────────────────────────────────────────────
  const topMachines = byMachineRaw.slice(0, 14).map((m: any) => ({
    ...m,
    avg_setup: num(analyticsByMachineMap.get(m.machine)?.avg_setup ?? 0),
  }))

  // ── Top clients this month ─────────────────────────────────────────────────
  const byClient = (month.by_client as Array<{ client: string; produced: number }>) || []
  const topClients = byClient.slice(0, 6)

  // ── Final Return ──────────────────────────────────────────────────────────
  
  let realBacklogPieces = 0;

  // Sum remaining pieces from all orders across MAQUINA1–MAQUINA14.
  // Use total - produced per order (only where work is still pending).
  const machinesRaw = capacity.machines || [];
  machinesRaw.forEach(m => {
    const mMatch = m.machine.match(/MAQUINA(\d+)/i);
    if (mMatch) {
      const mNum = parseInt(mMatch[1]);
      if (mNum >= 1 && mNum <= 14) {
        const orders = (m as any).orders_in_progress || [];
        orders.forEach((o: any) => {
          const total = num(o.total);
          const produced = num(o.produced);
          const pending = Math.max(0, total - produced);
          if (pending > 0) realBacklogPieces += pending;
        });
      }
    }
  });

  // Fallback: use system total if we somehow got 0 from the machine loop
  const globalRemaining = realBacklogPieces > 0
    ? realBacklogPieces
    : Math.max(0, num(capacity.total_pieces_system) - num(capacity.total_completed));


  return {
    production: {
      daily: { 
        value: dailyValue, 
        delta: num(today.efficiency) - 80, 
        remaining: globalRemaining // Use the real floor backlog
      },
      weekly: { 
        value: weeklyValue, 
        delta: weekEfficiency - 80, 
        remaining: globalRemaining 
      },
      monthly: { 
        value: monthlyValue, 
        delta: monthEfficiency - 80, 
        remaining: globalRemaining 
      },
      annual: { 
        value: annualValue, 
        delta: pctDelta(monthlyValue, Math.max(1, annualValue / 12)),
        remaining: globalRemaining 
      },
    },
    efficiencyTrends,
    machinery: {
      active: activeMachines,
      inactive: inactiveMachines,
      machines: machineList,
    },
    efficiency: weekEfficiency,
    avgSetup: globalAvgSetup,
    totalRemainingPieces: globalRemaining,
    topMachines,
    topClients,
    revenueOnMachines: printavo.matched_revenue || 0,
    generatedRevenueToday: printavo.generated_revenue_today || 0,
  }
}

// ─── Invoices & Work Orders ───────────────────────────────────────────────────

export async function fetchInvoices(filters: { status?: string; type?: string; search?: string } = {}): Promise<Invoice[]> {
  return mosProxy('invoices', filters as any) as Promise<Invoice[]>
}

export async function fetchInvoice(id: string): Promise<Invoice> {
  return mosProxy(`invoices/${id}`) as Promise<Invoice>
}

export async function createInvoice(data: Partial<Invoice>): Promise<Invoice> {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/api/mos?endpoint=invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    // Capturar el error real del servidor para diagnóstico
    let detail = `HTTP ${res.status}`
    try {
      const errBody = await res.json()
      detail = JSON.stringify(errBody)
    } catch {
      detail = await res.text().catch(() => detail)
    }
    throw new Error(`Failed to create invoice [${detail}]`)
  }
  return res.json()
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/api/mos?endpoint=invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update invoice')
  return res.json()
}

export async function deleteInvoice(id: string): Promise<any> {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/api/mos?endpoint=invoices/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.detail || 'Failed to delete invoice')
  }
  return res.json()
}

export async function approveInvoice(id: string): Promise<any> {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/api/mos?endpoint=invoices/${id}/approve`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to approve invoice')
  return res.json()
}

export async function fetchWorkOrders(filters: { status?: string; operator_id?: string; search?: string } = {}): Promise<WorkOrder[]> {
  return mosProxy('work-orders', filters as any) as Promise<WorkOrder[]>
}

export async function updateWorkOrder(id: string, data: Partial<WorkOrder>): Promise<WorkOrder> {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/api/mos?endpoint=work-orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update work order')
  return res.json()
}

// ─── Automations ──────────────────────────────────────────────────────────────

export async function fetchAutomations(): Promise<any[]> {
  return mosProxy('automations') as Promise<any[]>
}

export async function createAutomation(data: any): Promise<any> {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/api/mos?endpoint=automations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create automation')
  return res.json()
}

export async function updateAutomation(id: string, data: any): Promise<any> {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/api/mos?endpoint=automations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update automation')
  return res.json()
}

export async function deleteAutomation(id: string): Promise<any> {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${base}/api/mos?endpoint=automations/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete automation')
  return res.json()
}

export async function fetchOptions(): Promise<any> {
  return mosProxy('config/options') as Promise<any>
}
