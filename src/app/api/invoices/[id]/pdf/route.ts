import type { NextRequest } from "next/server"
import { renderInvoicePdf } from "@/lib/pdf/invoice-pdf"
import type { Invoice } from "@/lib/api"

// @react-pdf/renderer (renderToBuffer) requires the Node runtime.
export const runtime = "nodejs"

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const origin = new URL(request.url).origin

  const res = await fetch(`${origin}/api/mos?endpoint=invoices/${encodeURIComponent(id)}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    return Response.json({ error: `Invoice ${id} not found` }, { status: res.status })
  }
  const invoice = (await res.json()) as Invoice

  const pdf = await renderInvoicePdf(invoice)
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
