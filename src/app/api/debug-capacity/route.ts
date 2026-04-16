import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const base = request.nextUrl.origin
  const url = `${base}/api/mos?endpoint=capacity-plan`
  
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json() as any
    
    const machines = data.machines || []
    let totalBacklog = 0
    const detail: any[] = []
    
    for (const m of machines) {
      const mMatch = m.machine.match(/MAQUINA(\d+)/i)
      if (mMatch) {
        const mNum = parseInt(mMatch[1])
        if (mNum >= 1 && mNum <= 14) {
          const orders = m.orders_in_progress || []
          let machinePending = 0
          for (const o of orders) {
            const total = Number(o.total || 0)
            const produced = Number(o.produced || 0)
            const pending = Math.max(0, total - produced)
            machinePending += pending
            totalBacklog += pending
          }
          detail.push({
            machine: m.machine,
            order_count: orders.length,
            machine_pending: machinePending,
            orders: orders.map((o: any) => ({
              order_number: o.order_number,
              total: o.total,
              produced: o.produced,
              pending: Math.max(0, Number(o.total || 0) - Number(o.produced || 0))
            }))
          })
        }
      }
    }
    
    return Response.json({
      computed_backlog: totalBacklog,
      system_total_pieces: data.total_pieces_system,
      system_total_completed: data.total_completed,
      system_in_production: data.in_production,
      machines: detail
    })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
