import { NextResponse } from "next/server";
import { fetchManyPages, PrintavoOrder } from "@/lib/printavo";
import fs from "fs";
import path from "path";

// Server-side In-memory Cache (TTL: 5 minutes)
let cachedData: any = null;
let lastCacheUpdate: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

// ─── MOS Auth helpers (mirrors /api/mos logic – avoids self-fetch on Vercel) ───
const MOS_BACKEND_URL =
  process.env.MOS_BACKEND_URL ||
  "https://mosdatabase-backend.k9pirj.easypanel.host";
const MOS_INTERNAL_TOKEN = process.env.MOS_INTERNAL_TOKEN || "";
const MOS_SERVICE_EMAIL = process.env.MOS_SERVICE_EMAIL || "";
const MOS_SERVICE_PASSWORD = process.env.MOS_SERVICE_PASSWORD || "";

let _cachedToken: string | null = null;
let _tokenExpiry = 0;

async function getMosToken(): Promise<string | null> {
  // 1. Try internal sync token first
  if (MOS_INTERNAL_TOKEN) {
    try {
      const r = await fetch(`${MOS_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${MOS_INTERNAL_TOKEN}` },
        cache: "no-store",
      });
      if (r.ok) return MOS_INTERNAL_TOKEN;
    } catch {}
  }

  // 2. Use cached email/password session
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  // 3. Login with service credentials
  if (!MOS_SERVICE_EMAIL || !MOS_SERVICE_PASSWORD) return null;

  try {
    const res = await fetch(`${MOS_BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: MOS_SERVICE_EMAIL,
        password: MOS_SERVICE_PASSWORD,
      }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const setCookie = res.headers.get("set-cookie") || "";
    const match = setCookie.match(/session_token=([^;]+)/);
    if (!match) return null;

    _cachedToken = match[1];
    _tokenExpiry = Date.now() + 6 * 24 * 60 * 60 * 1000;
    return _cachedToken;
  } catch {
    return null;
  }
}

async function mosFetch(endpoint: string): Promise<any> {
  const token = await getMosToken();
  if (!token) throw new Error("MOS authentication failed");

  const res = await fetch(`${MOS_BACKEND_URL}/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Cookie: `session_token=${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`MOS /${endpoint} failed: ${res.status}`);
  return res.json();
}

// ─── Ledger path: /tmp works on Vercel serverless; falls back to data/ locally ─
const LEDGER_PATH = (() => {
  const tmp = "/tmp/finished_orders.json";
  const local = path.join(process.cwd(), "data", "finished_orders.json");
  // On Vercel, process.env.VERCEL === '1'
  return process.env.VERCEL === "1" ? tmp : local;
})();

function readLedger(): Record<string, { date: string; revenue: number }> {
  try {
    if (fs.existsSync(LEDGER_PATH)) {
      return JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
    }
  } catch {}
  return {};
}

function writeLedger(
  ledger: Record<string, { date: string; revenue: number }>
) {
  try {
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
  } catch (e) {
    console.error("[Ledger] Write failed:", e);
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export async function GET() {
  try {
    // 5-minute in-memory cache
    const now = Date.now();
    if (cachedData && now - lastCacheUpdate < CACHE_TTL) {
      console.log("[Printavo API] Serving from cache");
      return NextResponse.json(cachedData);
    }

    console.log("[Printavo API] Fetching fresh data…");

    // 1. Fetch MOS orders + capacity plan in parallel (direct, no self-call)
    const [mosAllOrders, mosCapacityData, printavoBatch] = await Promise.all([
      mosFetch("orders"),
      mosFetch("capacity-plan"),
      fetchManyPages(5),
    ]);

    // 2. Build Printavo lookup map
    const printavoMap = new Map<string, PrintavoOrder>();
    printavoBatch.forEach((o: PrintavoOrder) => {
      if (!o) return;
      printavoMap.set(String(o.visual_id), o);
      printavoMap.set(String(o.id), o);
    });

    // 3. Global inventory map (true denominator for unit price)
    const fullOrderInventoryMap = new Map<string, number>();
    (mosAllOrders as any[]).forEach((order: any) => {
      if (order.order_number) {
        const oNum = String(order.order_number);
        const qty = Number(
          order.total_pieces || order.quantity || order.total || 0
        );
        fullOrderInventoryMap.set(
          oNum,
          (fullOrderInventoryMap.get(oNum) || 0) + qty
        );
      }
    });

    // 4. Produced revenue per machine
    const orderToMachineMap = new Map<string, string>();
    let totalPiecesInQueue = 0;
    let totalProducedRevenueAcc = 0;
    const machines = (mosCapacityData as any)?.machines || [];

    machines.forEach((machine: any) => {
      const machineOrders = machine.orders_in_progress || [];
      machineOrders.forEach((item: any) => {
        if (item.order_number) {
          const oNum = String(item.order_number);
          orderToMachineMap.set(oNum, machine.machine || "Machine");

          const jobTotalPieces = Number(item.total || 0);
          const jobProducedPieces = Number(item.produced || 0);
          totalPiecesInQueue += Math.max(0, jobTotalPieces - jobProducedPieces);

          const pOrder = printavoMap.get(oNum);
          const totalInventoryInMOS =
            fullOrderInventoryMap.get(oNum) || jobTotalPieces;

          if (pOrder && totalInventoryInMOS > 0) {
            const unitPrice = (pOrder.order_total || 0) / totalInventoryInMOS;
            totalProducedRevenueAcc += jobProducedPieces * unitPrice;
          }
        }
      });
    });

    // 5. Build final pipeline
    const targetCategories = [
      "MAQUINARIA",
      "SCHEDULING",
      "READY TO SCHEDULED",
      "BLANKS",
      "SCREENS",
      "NECK",
      "FINAL BILL",
    ];
    const activeBoards = new Set(targetCategories);
    const finalPipelineOrders: any[] = [];

    (mosAllOrders as any[]).forEach((mosOrder: any) => {
      const mosId = String(mosOrder.order_number);
      const mosBoard = (mosOrder.board || "").toUpperCase();
      const pOrder = printavoMap.get(mosId);
      const pStatus = (pOrder?.orderstatus?.name || "").toUpperCase();

      if (pStatus.includes("COMPLETED")) return;

      const machineName = orderToMachineMap.get(mosId);
      const isMaquinaria = !!machineName;

      if (activeBoards.has(mosBoard) || isMaquinaria) {
        const enrichedOrder: any = {
          id: mosOrder.order_id || `mos-${mosId}`,
          visual_id: Number(mosId),
          printavo_id: pOrder?.id || null,
          // Extract the real Printavo work_order URL from the MOS job_title_a field
          // e.g. "https://prosper-mfg.printavo.com/work_orders/f082c5471ec8e8811527ac08da5d347a"
          printavo_url: (() => {
            const jt = mosOrder.job_title_a;
            // Case A: job_title_a is an object with a 'url' property
            if (jt && typeof jt === 'object' && jt.url) return String(jt.url);
            
            // Case B: job_title_a is a string that contains the URL
            const jobTitleStr = String(jt || mosOrder.job_title || "");
            const match = jobTitleStr.match(/https:\/\/[^\s]*printavo\.com\/work_orders\/[a-f0-9]+/i);
            if (match) return match[0];
            
            // Fallback 1: Use Printavo API public_url if available
            if (pOrder?.public_url) return pOrder.public_url;
            
            // Fallback 2: Construct URL (last resort, might 404 if not a hash)
            return `https://prosper-mfg.printavo.com/work_orders/${pOrder?.id || mosId}`;
          })(),
          order_nickname:
            mosOrder.order_name ||
            pOrder?.order_nickname ||
            `Order #${mosId}`,
          order_total: pOrder?.order_total || 0,
          customer_due_date: pOrder?.customer_due_date || mosOrder.due_date,
          orderstatus: pOrder?.orderstatus || {
            name: mosBoard || "Active",
            color: "#ccc",
          },
          mos_machine: machineName,
          virtual_boards: [],
        };

        if (isMaquinaria) enrichedOrder.virtual_boards.push("MAQUINARIA");
        if (activeBoards.has(mosBoard))
          enrichedOrder.virtual_boards.push(mosBoard);

        finalPipelineOrders.push(enrichedOrder);
      }
    });

    // 6. Statistics
    const dailyCap =
      machines.reduce(
        (sum: number, m: any) => sum + (Number(m.avg_daily_production) || 500),
        0
      ) || 5000;
    const totalEstimatedDeliveryDays =
      Math.max(1, Math.ceil(totalPiecesInQueue / dailyCap)) + 3;

    // 7. Daily generated revenue ledger
    const isNewLedger = !fs.existsSync(LEDGER_PATH);
    const ledger = readLedger();
    const todayDate = new Date().toISOString().split("T")[0];
    let dailyGeneratedRevenue = 0;
    let ledgerChanged = false;

    (mosAllOrders as any[]).forEach((order: any) => {
      const orderId = String(order.order_id || order.order_number);
      const isFinished =
        (order.board || "").toUpperCase() === "COMPLETOS" ||
        (order.production_status || "").toUpperCase() === "LISTO PARA ENVIO" ||
        (order.prod_status || "").toUpperCase() === "LISTO PARA ENVIO";

      if (isFinished && !ledger[orderId]) {
        const pOrder = printavoMap.get(String(order.order_number));
        const revenue = pOrder?.order_total || 0;
        const orderDate = (order.updated_at || "").split("T")[0];
        const recordDate =
          isNewLedger && orderDate !== todayDate ? "ARCHIVE" : todayDate;

        ledger[orderId] = { date: recordDate, revenue };
        ledgerChanged = true;
      }
    });

    if (ledgerChanged) writeLedger(ledger);

    Object.values(ledger).forEach((entry) => {
      if (entry.date === todayDate) dailyGeneratedRevenue += entry.revenue;
    });

    // 8. Revenue timeline
    const timelineMap = new Map<string, number>();
    finalPipelineOrders.forEach((o) => {
      if (!o?.customer_due_date) return;
      try {
        const dateKey = new Date(o.customer_due_date).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        );
        timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + (o.order_total || 0));
      } catch {}
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
      orders: finalPipelineOrders,
    };

    cachedData = result;
    lastCacheUpdate = Date.now();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Printavo API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
