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
    // Build a lookup map of MOS Order Number -> Machine Name
    const orderToMachineMap = new Map<string, string>();
    let totalPiecesInQueue = 0;

    mosData.machinery.machines.forEach(machine => {
      // Add all pieces remaining on this machine
      totalPiecesInQueue += machine.remainingPieces || 0;
      
      // Collect order references to map them to this machine
      if (machine.activeOrders) {
        machine.activeOrders.forEach(o => {
          orderToMachineMap.set(String(o).trim().toLowerCase(), machine.name);
        });
      }
    });

    const activeMosOrderNumbers = Array.from(orderToMachineMap.keys());

    // 4. Perform Matching and Calculate Metrics
    let projectedRevenue = 0;
    const matchedOrders: PrintavoOrder[] = [];
    const pipelineOrders: PrintavoOrder[] = [];
    
    // Track unique categories for the filters
    const foundCategoriesSet = new Set<string>();

    const targetLogisticsStates = [
      "Scheduling", 
      "Blanks", 
      "Screens", 
      "Neck", 
      "Final Bill", 
      "Ready to Schedule"
    ];

    printavoOrders.forEach(order => {
      const pId = String(order.visual_id);
      const poNum = String(order.visual_po_number || "").toLowerCase().trim();
      const nickname = (order.order_nickname || "").toLowerCase();
      const statusName = (order.orderstatus?.name || "").toLowerCase();

      // Check if it's on a MOS machine (Production)
      const matchedMosOrderNumber = activeMosOrderNumbers.find(mosOrder => {
        return pId === mosOrder || (poNum && mosOrder.includes(poNum)) || nickname.includes(String(mosOrder));
      });

      if (matchedMosOrderNumber) {
        const machineName = orderToMachineMap.get(matchedMosOrderNumber);
        if (machineName) {
          order.mos_machine = machineName;
          foundCategoriesSet.add("Maquinaria");
          matchedOrders.push(order);
        }
      } else {
        // If not in production, check if it matches one of the requested logistics boards
        const matchedState = targetLogisticsStates.find(s => statusName.includes(s.toLowerCase()));
        if (matchedState) {
          foundCategoriesSet.add(matchedState);
        }
      }
      
      // Aggregate project revenue for all non-completed orders
      const isCompleted = statusName.includes("complete") || statusName.includes("done");
      if (!isCompleted) {
        projectedRevenue += order.order_total || 0;
        pipelineOrders.push(order);
      }
    });

    // 5. Calculate cross-border efficiency
    const dailyCap = mosData.machinery.machines.reduce((sum, m) => sum + (m.avgDaily || 0), 0) || 5000;
    const daysInQueue = totalPiecesInQueue / dailyCap;
    const totalEstimatedDeliveryDays = Math.max(1, Math.ceil(daysInQueue)) + 3; // 3 days baseline transit

    // 6. Generate Revenue Timeline
    const timelineMap = new Map<string, number>();
    pipelineOrders.forEach(o => {
      if (!o.customer_due_date) return;
      const dateKey = new Date(o.customer_due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + (o.order_total || 0));
    });

    const timeline = Array.from(timelineMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 14);

    return NextResponse.json({
      revenue: projectedRevenue,
      matched_revenue: matchedOrders.reduce((sum, o) => sum + o.order_total, 0),
      volume: totalPiecesInQueue,
      delivery_days: totalEstimatedDeliveryDays,
      active_mos_orders_found: matchedOrders.length,
      tableros: Array.from(foundCategoriesSet).sort(),
      timeline,
      orders: pipelineOrders
    });

  } catch (error: any) {
    console.error("Printavo API error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
