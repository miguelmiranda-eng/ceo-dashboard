import { NextResponse } from "next/server"
import { updateOrderStatus } from "@/lib/printavo"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { statusId } = await request.json()
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id)
    
    if (isNaN(orderId) || !statusId) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    const success = await updateOrderStatus(orderId, statusId)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to update Printavo" }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
