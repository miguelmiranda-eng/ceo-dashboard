import { NextResponse } from "next/server";
import { fetchManyPages, PrintavoOrder } from "@/lib/printavo";
import fs from "fs";
import path from "path";

// Server-side In-memory Cache (TTL: 5 minutes)
let cachedData: any = null;
let lastCacheUpdate: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

export async function GET(request: Request) {
  try {
    // 5-minute server-side cache (Speed Boost)
    const now = Date.now();
    if (cachedData && (now - lastCacheUpdate < CACHE_TTL)) {
      console.log("[Printavo API] Serving from cache (Speed Boost)");
      return NextResponse.json(cachedData);
    }

    console.log("[Printavo API] Cache expired or empty. Fetching 1000 orders (this will take ~45s)...");

    const origin = request.headers.get("origin") || request.headers.get("host") || "";
    const protocol = origin.includes("localhost") ? "http" : "https";
    const absoluteOrigin = origin.startsWith("http") ? origin : `${protocol}://${origin}`;

    // 1. Fetch ALL active orders from MOS (This is our Master List)
    const mosOrdersRes = await fetch(`${absoluteOrigin}/api/mos?endpoint=orders`, { cache: 'no-store' });
    if (!mosOrdersRes.ok) throw new Error(`MOS Orders API failed: ${mosOrdersRes.status}`);
    const mosAllOrders: any[] = await mosOrdersRes.json();

    // 2. Fetch MOS Capacity Plan (For machine/maquinaria mapping)
    const mosCapacityRes = await fetch(`${absoluteOrigin}/api/mos?endpoint=capacity-plan`, { cache: 'no-store' });
    if (!mosCapacityRes.ok) throw new Error(`MOS Capacity API failed: ${mosCapacityRes.status}`);
    const mosCapacityData = await mosCapacityRes.json();

    // 3. MASS FETCH: Fetch 1000 records from Printavo for revenue enrichment
    const printavoBatch = await fetchManyPages(5);
    const printavoMap = new Map<string, PrintavoOrder>();
    printavoBatch.forEach(o => {
      if (!o) return;
      printavoMap.set(String(o.visual_id), o);
      printavoMap.set(String(o.id), o);
    });

    // 4. GLOBAL INVENTORY MAP: Aggregate total pieces across ALL MOS orders (not just machinery)
    // This provides the TRUE denominator for calculating unit price based on Printavo invoice.
    const fullOrderInventoryMap = new Map<string, number>();
    mosAllOrders.forEach((order: any) => {
      if (order.order_number) {
        const oNum = String(order.order_number);
        // Field normalization: check common MOS quantity fields
        const qty = Number(order.total_pieces || order.quantity || order.total || 0);
        fullOrderInventoryMap.set(oNum, (fullOrderInventoryMap.get(oNum) || 0) + qty);
      }
    });

    // 5. ACCUMULATE PRODUCED REVENUE: Loop through machines from capacity plan
    const orderToMachineMap = new Map<string, string>();
    let totalPiecesInQueue = 0;
    let totalProducedRevenueAcc = 0;
    const machines = mosCapacityData?.machines || [];

    machines.forEach((machine: any) => {
      const machineOrders = machine.orders_in_progress || [];
      machineOrders.forEach((item: any) => {
        if (item.order_number) {
          const oNum = String(item.order_number);
          orderToMachineMap.set(oNum, machine.machine || "Machine");
          
          const jobTotalPieces = Number(item.total || 0);
          const jobProducedPieces = Number(item.produced || 0);
          totalPiecesInQueue += Math.max(0, jobTotalPieces - jobProducedPieces);

          // Real-time Global Precision Formula
          const pOrder = printavoMap.get(oNum);
          const totalInventoryInMOS = fullOrderInventoryMap.get(oNum) || jobTotalPieces;

          if (pOrder && totalInventoryInMOS > 0) {
            const unitPrice = (pOrder.order_total || 0) / totalInventoryInMOS;
            const jobProducedRevenue = jobProducedPieces * unitPrice;
            totalProducedRevenueAcc += jobProducedRevenue;
          }
        }
      });
    });
    // 5. Build Final Pipeline using MOS Orders as Source of Truth
    const finalPipelineOrders: PrintavoOrder[] = [];
    const targetCategories = [
      "MAQUINARIA",
      "SCHEDULING", 
      "READY TO SCHEDULED", 
      "BLANKS", 
      "SCREENS", 
      "NECK", 
      "FINAL BILL"
    ];

    const activeBoards = new Set(targetCategories);

    mosAllOrders.forEach((mosOrder: any) => {
      const mosId = String(mosOrder.order_number);
      const mosBoard = (mosOrder.board || "").toUpperCase();
      
      const pOrder = printavoMap.get(mosId);
      const pStatus = (pOrder?.orderstatus?.name || "").toUpperCase();
      
      // Exclude COMPLETED
      if (pStatus.includes("COMPLETED")) return;

      const machineName = orderToMachineMap.get(mosId);
      const isMaquinaria = !!machineName;
      
      if (activeBoards.has(mosBoard) || isMaquinaria) {
        const enrichedOrder: any = {
          id: mosOrder.order_id || `mos-${mosId}`,
          visual_id: Number(mosId),
          order_nickname: mosOrder.order_name || pOrder?.order_nickname || `Order #${mosId}`,
          order_total: pOrder?.order_total || 0,
          customer_due_date: pOrder?.customer_due_date || mosOrder.due_date,
          orderstatus: pOrder?.orderstatus || { name: mosBoard || "Active", color: "#ccc" },
          mos_machine: machineName,
          virtual_boards: []
        };

        if (isMaquinaria) enrichedOrder.virtual_boards.push("MAQUINARIA");
        if (activeBoards.has(mosBoard)) enrichedOrder.virtual_boards.push(mosBoard);

        finalPipelineOrders.push(enrichedOrder);
      }
    });

    // 6. Statistics calculation
    const dailyCap = machines.reduce((sum: number, m: any) => sum + (Number(m.avg_daily_production) || 500), 0) || 5000;
    const totalEstimatedDeliveryDays = Math.max(1, Math.ceil(totalPiecesInQueue / dailyCap)) + 3;

    // 7. DAILY GENERATED REVENUE (Ledger-based to avoid stale data)
    const LEDGER_PATH = path.join(process.cwd(), "data", "finished_orders.json");
    let ledger: Record<string, { date: string, revenue: number }> = {};
    const isNewLedger = !fs.existsSync(LEDGER_PATH);

    if (!isNewLedger) {
      try {
        ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
      } catch (e) {
        console.error("[Ledger] Failed to read ledger, starting fresh");
      }
    }

    const todayDate = new Date().toISOString().split('T')[0];
    let dailyGeneratedRevenue = 0;
    let ledgerChanged = false;

    mosAllOrders.forEach((order: any) => {
      const orderId = String(order.order_id || order.order_number);
      const isFinished = 
        (order.board || "").toUpperCase() === "COMPLETOS" || 
        (order.production_status || "").toUpperCase() === "LISTO PARA ENVIO" ||
        (order.prod_status || "").toUpperCase() === "LISTO PARA ENVIO";

      if (isFinished) {
        if (!ledger[orderId]) {
          const pOrder = printavoMap.get(String(order.order_number));
          const revenue = pOrder?.order_total || 0;
          
          // If it's a new ledger, mark everything as "OLD" so we don't skew today's numbers
          // IF the order was updated before today, also mark as OLD
          const orderDate = (order.updated_at || "").split('T')[0];
          const recordDate = (isNewLedger && orderDate !== todayDate) ? "ARCHIVE" : todayDate;
          
          ledger[orderId] = { date: recordDate, revenue };
          ledgerChanged = true;
        }
      }
    });

    if (ledgerChanged) {
      fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
    }

    // Calculate total for today
    Object.values(ledger).forEach(entry => {
      if (entry.date === todayDate) {
        dailyGeneratedRevenue += entry.revenue;
      }
    });

    // 8. Generate Revenue Timeline
    const timelineMap = new Map<string, number>();
    finalPipelineOrders.forEach(o => {
      if (!o?.customer_due_date) return;
      try {
        const dateKey = new Date(o.customer_due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + (o.order_total || 0));
      } catch (e) {}
    });

    const pipelineTimeline = Array.from(timelineMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 14);

    const result = {
      revenue: finalPipelineOrders.reduce((sum, o) => sum + o.order_total, 0),
      matched_revenue: totalProducedRevenueAcc,
      generated_revenue_today: dailyGeneratedRevenue,
      volume: totalPiecesInQueue,
      delivery_days: totalEstimatedDeliveryDays,
      active_mos_orders_found: finalPipelineOrders.length,
      tableros: targetCategories,
      timeline: pipelineTimeline,
      orders: finalPipelineOrders
    };

    // Store in cache for 5 minutes
    cachedData = result;
    lastCacheUpdate = Date.now();

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Printavo API error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
