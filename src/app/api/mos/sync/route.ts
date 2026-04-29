import { NextResponse } from "next/server"

export async function GET() {
  const MOS_BACKEND_URL = process.env.MOS_BACKEND_URL || "http://127.0.0.1:8000"
  
  const SYNC_TOKEN = process.env.INTERNAL_SYNC_TOKEN || "token_mos_dashboard_2026"
  
  try {
    // 1. Fetch all invoices
    const invRes = await fetch(`${MOS_BACKEND_URL}/api/invoices`, {
      headers: { "Authorization": `Bearer ${SYNC_TOKEN}` }
    })
    const invoices = await invRes.json()
    
    // 2. Fetch all work orders
    const woRes = await fetch(`${MOS_BACKEND_URL}/api/work-orders`, {
      headers: { "Authorization": `Bearer ${SYNC_TOKEN}` }
    })
    const workOrders = await woRes.json()
    
    const existingInvIds = new Set(workOrders.map((wo: any) => wo.source_invoice_id))
    let createdCount = 0
    
    // 3. Create missing work orders
    for (const inv of invoices) {
      if (!existingInvIds.has(inv.invoice_id)) {
        await fetch(`${MOS_BACKEND_URL}/api/work-orders`, {
          method: 'POST',
          headers: { 
            "Authorization": `Bearer ${SYNC_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            work_order_id: "string", // Router will override this with a real WO ID
            source_invoice_id: inv.invoice_id,
            production_status: "artwork_pending",
            production_notes: inv.production_notes || `Sync from Invoice ${inv.invoice_id}`,
            packing_details: { bags: "individual", boxes: "master" }
          })
        })
        createdCount++
      }
    }
    
    return NextResponse.json({ success: true, createdCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
