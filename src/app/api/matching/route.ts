import { NextRequest, NextResponse } from "next/server";
import { fetchManyPages, PrintavoOrder } from "@/lib/printavo";

export const dynamic = 'force-dynamic';

const MOS_BACKEND_URL =
  process.env.MOS_BACKEND_URL ||
  "http://127.0.0.1:8001";
const MASTER_API_KEY = process.env.MASTER_API_KEY || "cw_0x689RpI-jtRR7oE8h_eQsKImvJapA8QfGEyS2wA=";

/** Internal MOS fetcher using Master API Key (Header + URL Fallback) */
async function mosFetch(endpoint: string) {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${MOS_BACKEND_URL}/api/${endpoint}${separator}api_key=${MASTER_API_KEY}`;
  
  const res = await fetch(url, { 
    cache: "no-store",
    headers: {
      "X-API-Key": MASTER_API_KEY
    }
  });

  if (!res.ok) throw new Error(`MOS API error: ${res.status}`);
  return res.json();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    console.log(`[Matching API] Fetching data... (Period: ${dateFrom} to ${dateTo})`);

    // Fetch MOS orders, Printavo invoices (via internal proxy), and Production Summary
    const summaryEndpoint = dateFrom && dateTo 
      ? `production-summary?date_from=${dateFrom}&date_to=${dateTo}`
      : `production-summary`;

    const [mosOrders, printavoBatch, productionSummary] = await Promise.all([
      mosFetch("orders?limit=5000"), // Increased limit to include old orders
      fetchManyPages(25),           // Increased from 10 to 25 pages (~5000 orders)
      mosFetch(summaryEndpoint),
    ]);

    const printavoCount = printavoBatch?.length || 0;
    console.log(`[Matching] Printavo orders loaded: ${printavoCount}`);


    // Build Printavo lookup map (keyed by visual_id)
    const printavoMap = new Map<string, PrintavoOrder>();
    printavoBatch.forEach((o: PrintavoOrder) => {
      if (!o) return;
      printavoMap.set(String(o.visual_id).trim(), o);
    });

    // Perform Matching using order_number
    const excludedBoards = ['MASTER', 'EJEMPLOS', 'EDI', 'CANCELLED', 'PAPELERA DE RECICLAJE'];

    const results = (mosOrders as any[])
      .filter((mosOrder) => {
        // Exclude Trash, Ghost orders (no board), and explicitly excluded boards
        if (mosOrder.is_trash) return false;
        if (!mosOrder.board || mosOrder.board === "") return false;
        
        const board = String(mosOrder.board).toUpperCase();
        return !excludedBoards.includes(board);
      })
      .map((mosOrder) => {
        const orderNum = String(mosOrder.order_number).trim();
        const board = String(mosOrder.board).toUpperCase();
        const pOrder = printavoMap.get(orderNum);
        
        const produced = (productionSummary as any)[orderNum] || { total_produced: 0, last_date: null };
        
        // Special logic for RESPALDO MONDAY: use final_bill date as the production date
        const fbDate = mosOrder.final_bill; // YYYY-MM-DD
        const isRespaldo = board === 'RESPALDO MONDAY';
        const isFbInRange = dateFrom && dateTo && fbDate && fbDate >= dateFrom && fbDate <= dateTo;
        
        // isInRange: true when no filter, or when order has production logs, or is Respaldo in range
        const isInRange = (!dateFrom && !dateTo) || !!(productionSummary as any)[orderNum] || (isRespaldo && isFbInRange);

        return {
          order_number: orderNum,
          client: mosOrder.client_name || mosOrder.client || pOrder?.customer?.company || "Unknown",
          mos_status: mosOrder.board,
          mos_pieces: mosOrder.quantity || 0,
          printavo_id: pOrder?.id || null,
          printavo_total: pOrder?.order_total || 0,
          printavo_status: pOrder?.orderstatus?.name || "Not Found",
          is_matched: !!pOrder,
          // For Respaldo Monday, if it's in range, show all pieces as produced
          mos_produced: isRespaldo ? (isFbInRange || (!dateFrom && !dateTo) ? (mosOrder.quantity || 0) : 0) : produced.total_produced,
          last_prod_date: isRespaldo && fbDate ? fbDate : (produced.last_date ? produced.last_date.substring(0, 10) : null),
          is_in_date_range: isInRange,
          printavo_url: pOrder ? `https://prosper-mfg.printavo.com/work_orders/${pOrder.id}` : null,
        };
      });

    // Ground truth: all pieces produced in this period
    // 1. From MOS production logs
    const logsProduced = Object.values(productionSummary as Record<string, any>)
      .reduce((sum, v) => sum + (v?.total_produced || 0), 0);
    
    // 2. From RESPALDO MONDAY (using final_bill date filter)
    const respaldoProduced = results
      .filter(r => r.mos_status.toUpperCase() === 'RESPALDO MONDAY' && r.is_in_date_range)
      .reduce((sum, r) => sum + r.mos_pieces, 0);

    // Ground truth pieces produced (MOS production logs, date-filtered by backend)
    const trueTotalProduced = logsProduced + respaldoProduced;

    // For billing KPIs: matched orders that had production activity in the selected period
    const allMatched = results.filter(r => r.is_matched);

    const billingInRange = allMatched.filter(r => {
      // If no date filter, show all matched orders
      if (!dateFrom || !dateTo) return true;
      // If date filter active, include orders with logs OR Respaldo orders in range
      return r.is_in_date_range && r.mos_produced > 0;
    });

    // Final Bill: ALWAYS global (represents current backlog pending to be billed)
    const finalBill = allMatched.filter(r => r.printavo_status === 'Final Bill');
    
    // Completed: DATE-FILTERED (represents money collected/finished in the selected period)
    const completed = billingInRange.filter(r => r.printavo_status === 'Completed');

    // Financial calculations: Proportional value based on what was produced in the period
    let totalValueProduced = 0;
    results.forEach(r => {
      if (r.is_matched && r.mos_pieces > 0 && r.mos_produced > 0) {
        const unitPrice = r.printavo_total / r.mos_pieces;
        totalValueProduced += r.mos_produced * unitPrice;
      }
    });
    
    const avgUnitPrice = trueTotalProduced > 0 ? (totalValueProduced / trueTotalProduced) : 0;

    const stats = {
      total_orders: allMatched.length,
      billed_count: completed.length,
      unbilled_count: finalBill.length,

      total_pieces_produced: trueTotalProduced,
      avg_unit_price: avgUnitPrice,
      total_value_produced: totalValueProduced,

      total_pieces_billed: completed.reduce((sum, r) => sum + (r.printavo_total || 0), 0),
      total_pieces_ready:  finalBill.reduce((sum, r) => sum + (r.printavo_total || 0), 0),
    };



    return NextResponse.json({ stats, orders: results });
  } catch (error: any) {
    console.error("[Matching API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
