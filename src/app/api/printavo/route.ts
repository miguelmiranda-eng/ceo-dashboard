import { NextResponse } from "next/server";
import { fetchPipelineOrders, PrintavoOrder } from "@/lib/printavo";
import { fetchDashboardData, DashboardFilters } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = new URL(req.url).origin;
    const lang = searchParams.get("lang") || "es";

    // 1. Fetch Printavo pipeline
    const printavoOrders = await fetchPipelineOrders();

    // 2. Fetch our production capacity globally
    const mosData = await fetchDashboardData({ lang, origin } as DashboardFilters);

    // 3. Extract the list of ALL active orders in our MOS currently in production
    // This looks at every machine running and aggregates the order numbers
    const activeMosOrderNumbers = new Set<string>();
    let totalPiecesInQueue = 0;

    mosData.machinery.machines.forEach(machine => {
      // Add all pieces remaining on this machine
      totalPiecesInQueue += machine.remainingPieces || 0;
      
      // Collect order references
      if (machine.activeOrders) {
        machine.activeOrders.forEach(o => activeMosOrderNumbers.add(String(o).trim().toLowerCase()));
      }
    });

    // 4. Perform Matching and Calculate Metrics
    let projectedRevenue = 0;
    const matchedOrders: PrintavoOrder[] = [];
    const pipelineOrders: PrintavoOrder[] = [];

    // Filter printavo orders. Printavo's order Nickname often contains the PO, 
    // or the visual_po_number matches directly. We aggressively try to match.
    printavoOrders.forEach(order => {
      // Only care about open/pending orders, usually anything that hasn't been purely archived
      // For this, we'll assume any order in the pipeline feed is relevant to future load.
      
      const pId = String(order.visual_id);
      const poNum = String(order.visual_po_number || "").toLowerCase().trim();
      const nickname = (order.order_nickname || "").toLowerCase();

      // Check if this printavo order is currently actively listed in MOS machines
      const isActiveInMos = Array.from(activeMosOrderNumbers).some(mosOrder => {
        return pId === mosOrder || (poNum && mosOrder.includes(poNum)) || nickname.includes(String(mosOrder));
      });

      if (isActiveInMos) {
        matchedOrders.push(order);
      }
      
      // We also aggregate all orders that aren't finished for the "Future Work" pipeline
      const isCompleted = order.orderstatus?.name?.toLowerCase().includes("complete") || 
                          order.orderstatus?.name?.toLowerCase().includes("done");

      if (!isCompleted) {
        projectedRevenue += order.order_total || 0;
        pipelineOrders.push(order);
      }
    });

    // We can also calculate standard estimated cross-border efficiency.
    // For Prosper (Mexico -> US), transit is typically 3-5 days. Let's do 3 days baseline + queue time.
    // Average daily production
    const dailyCap = mosData.machinery.machines.reduce((sum, m) => sum + (m.avgDaily || 0), 0) || 5000;
    const daysInQueue = totalPiecesInQueue / dailyCap;
    const crossBorderTransit = 3;
    const totalEstimatedDeliveryDays = Math.max(1, Math.ceil(daysInQueue)) + crossBorderTransit;

    // 5. Generate Revenue Timeline for charts
    const timelineMap = new Map<string, number>();
    pipelineOrders.forEach(o => {
      if (!o.customer_due_date) return;
      const dateKey = new Date(o.customer_due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + (o.order_total || 0));
    });

    const timeline = Array.from(timelineMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      // Keep only first 14 days of due dates for immediate pipeline overview
      .slice(0, 14);

    return NextResponse.json({
      revenue: projectedRevenue,
      matched_revenue: matchedOrders.reduce((sum, o) => sum + o.order_total, 0),
      volume: totalPiecesInQueue,
      delivery_days: totalEstimatedDeliveryDays,
      active_mos_orders_found: matchedOrders.length,
      timeline,
      orders: pipelineOrders
    });

  } catch (error: any) {
    console.error("Printavo API error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
