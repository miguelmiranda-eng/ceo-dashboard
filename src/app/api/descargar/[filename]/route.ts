import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { fetchDashboardData } from "@/lib/api"

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      preset: searchParams.get('preset') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    }

    // Fetch fresh data
    const data = await fetchDashboardData(filters)
    
    // Create Workbook
    const wb = XLSX.utils.book_new()

    // Sheet 1: Production Summary
    const prodHeaders = ["Metric", "Value", "Baseline (80%)", "Status"]
    const prodRows = [
      ["Produced Today", data.production.daily.value.toLocaleString(), "80%", data.production.daily.delta >= 0 ? "Above" : "Below"],
      ["Produced This Week", data.production.weekly.value.toLocaleString(), "80%", data.production.weekly.delta >= 0 ? "Above" : "Below"],
      ["Produced This Month", data.production.monthly.value.toLocaleString(), "80%", data.production.monthly.delta >= 0 ? "Above" : "Below"],
      ["Avg efficiency", `${data.efficiency}%`, "-", "Nominal"],
    ]
    const wsProd = XLSX.utils.aoa_to_sheet([prodHeaders, ...prodRows])
    XLSX.utils.book_append_sheet(wb, wsProd, "Production Summary")

    // Sheet 2: Machinery Audit
    const machHeaders = ["Machine ID", "Display Name", "Current Load (%)", "Alert Status", "Pieces in Queue"]
    const machRows = data.machinery.machines.map((m: any) => [
      m.id,
      m.name,
      `${m.capacity}%`,
      m.loadStatus?.toUpperCase() || "OK",
      m.remainingPieces || 0
    ])
    const wsMach = XLSX.utils.aoa_to_sheet([machHeaders, ...machRows])
    XLSX.utils.book_append_sheet(wb, wsMach, "Machinery Audit")

    // Generate binary array
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" })
    const uint8Array = new Uint8Array(buf)
    
    // Extract filename from URL params (e.g. Reporte_Produccion_MOS.xlsx)
    const fileName = params.filename || "Reporte_MOS.xlsx"
    
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": uint8Array.length.toString(),
      },
    })
  } catch (error) {
    console.error("Export Error FINAL:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
