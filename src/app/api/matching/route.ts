import { NextRequest, NextResponse } from "next/server";
import { fetchManyPages, PrintavoOrder } from "@/lib/printavo";
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns";

export const dynamic = 'force-dynamic';

const MOS_BACKEND_URL =
  process.env.MOS_BACKEND_URL ||
  "https://mosdatabase-backend.k9pirj.easypanel.host";
const MOS_INTERNAL_TOKEN = process.env.MOS_INTERNAL_TOKEN || process.env.INTERNAL_SYNC_TOKEN || "";
const MOS_SERVICE_EMAIL = process.env.MOS_SERVICE_EMAIL || "";
const MOS_SERVICE_PASSWORD = process.env.MOS_SERVICE_PASSWORD || "";

// Simple in-memory cache for the session token
let cachedSessionToken: string | null = null;

/** Internal MOS fetcher with Auth Fallback */
async function mosFetch(endpoint: string) {
  // 1. Try with the internal token or cached session token
  const token = cachedSessionToken || MOS_INTERNAL_TOKEN;
  
  let res = await fetch(`${MOS_BACKEND_URL}/api/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  // 2. If 401 and we have credentials, try to login and retry
  if (res.status === 401 && MOS_SERVICE_EMAIL && MOS_SERVICE_PASSWORD) {
    console.log("[Matching API] Token expired or invalid, attempting service login...");
    const loginRes = await fetch(`${MOS_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: MOS_SERVICE_EMAIL, password: MOS_SERVICE_PASSWORD }),
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      cachedSessionToken = loginData.access_token;
      
      // Retry the original request with the new token
      res = await fetch(`${MOS_BACKEND_URL}/api/${endpoint}`, {
        headers: { Authorization: `Bearer ${cachedSessionToken}` },
        cache: "no-store",
      });
    }
  }

  if (!res.ok) throw new Error(`MOS API error: ${res.status}`);
  return res.json();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = "orders";

    console.log(`[Matching API] Fetching data for reconciliation... (Local Date Filtering)`);

    // Fetch MOS orders and Printavo orders in parallel
    // Fetch 10 pages (2000 orders max) to cover Goodie/Spencers history
    const [mosOrders, printavoBatch] = await Promise.all([
      mosFetch(endpoint),
      fetchManyPages(10),
    ]);

    // 2. Filter out excluded boards from MOS
    const excludedBoards = ["RESPALDO MONDAY", "PAPELERA DE RECICLAJE"];
    let activeOrders = (mosOrders as any[]).filter(
      (o) => !excludedBoards.includes((o.board || "").toUpperCase())
    );

    // Apply date filter locally since backend /orders doesn't filter by date
    const preset = searchParams.get("preset");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const now = new Date();
    
    let dateStart: Date | null = null;
    let dateEnd: Date | null = null;

    if (preset === "today") {
      dateStart = startOfDay(now);
      dateEnd = endOfDay(now);
    } else if (preset === "yesterday") {
      dateStart = startOfDay(subDays(now, 1));
      dateEnd = endOfDay(subDays(now, 1));
    } else if (preset === "week") {
      dateStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
      dateEnd = endOfWeek(now, { weekStartsOn: 1 });
    } else if (preset === "month") {
      dateStart = startOfMonth(now);
      dateEnd = endOfMonth(now);
    } else if (preset === "custom" && dateFrom && dateTo) {
      dateStart = startOfDay(parseISO(dateFrom));
      dateEnd = endOfDay(parseISO(dateTo));
    }

    // Date filters will be applied after matching so we can use Printavo dates

    // 3. Build Printavo lookup map (keyed by visual_id)
    const printavoMap = new Map<string, PrintavoOrder>();
    printavoBatch.forEach((o: PrintavoOrder) => {
      if (!o) return;
      printavoMap.set(String(o.visual_id), o);
    });

    console.log(`[Matching] Printavo: ${printavoMap.size} orders loaded, MOS Active: ${activeOrders.length}`);

    // 4. Perform Matching
    let results = activeOrders.map((mosOrder) => {
      const orderNum = String(mosOrder.order_number).trim();
      const pOrder = printavoMap.get(orderNum);
      const filterDate = pOrder ? (pOrder.customer_due_date || pOrder.due_date) : mosOrder.created_at;

      let inRange = true;
      if (dateStart && dateEnd && filterDate) {
        const d = new Date(filterDate);
        inRange = d >= dateStart && d <= dateEnd;
      }

      return {
        order_number: orderNum,
        client: mosOrder.client_name || mosOrder.client || "Unknown",
        mos_status: mosOrder.board,
        mos_pieces: mosOrder.total_pieces || 0,
        printavo_id: pOrder?.id || null,
        printavo_total: pOrder?.order_total || 0,
        printavo_status: pOrder?.orderstatus?.name || "Not Found",
        is_matched: !!pOrder,
        printavo_url: pOrder ? `https://prosper-mfg.printavo.com/work_orders/${pOrder.id}` : null,
        invoice_url: pOrder?.public_url || null,
        updated_at: mosOrder.updated_at,
        _filter_date: filterDate,
        is_in_date_range: inRange
      };
    });

    // 5. Date Filter Flag already applied during mapping

    // 6. Calculate Stats
    const stats = {
      total_final_bill: results.length,
      billed_count: results.filter(r => r.printavo_status === 'Completed' && r.is_in_date_range).length,
      unbilled_count: results.filter(r => r.printavo_status !== 'Completed').length,
      total_value_matched: results.filter(r => r.printavo_status === 'Completed' && r.is_in_date_range).reduce((sum, r) => sum + r.printavo_total, 0),
    };

    return NextResponse.json({ stats, orders: results });
  } catch (error: any) {
    console.error("[Matching API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
