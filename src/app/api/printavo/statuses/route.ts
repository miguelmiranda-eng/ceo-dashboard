import { NextResponse } from "next/server"
import { fetchOrderStatuses } from "@/lib/printavo"

export async function GET() {
  try {
    const statuses = await fetchOrderStatuses()
    return NextResponse.json(statuses)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
