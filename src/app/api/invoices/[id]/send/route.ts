import type { NextRequest } from "next/server"
import { renderInvoicePdf } from "@/lib/pdf/invoice-pdf"
import type { Invoice } from "@/lib/api"

// @react-pdf/renderer (renderToBuffer) requires the Node runtime.
export const runtime = "nodejs"

/**
 * Email the invoice PDF to the client. Fired when an order moves to status "invoice".
 *
 * Safety model:
 *  - DRY-RUN by default whenever RESEND_API_KEY is absent (or ?dry=1). Renders the
 *    PDF and reports what *would* be sent, without sending — no real email leaves.
 *  - Idempotent: skips if `invoice_emailed_at` is already set (unless ?force=1).
 *
 * Env: RESEND_API_KEY, INVOICE_SENDER_EMAIL (default billing@prosper-mfg.com).
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const url = new URL(request.url)
  const origin = url.origin
  const force = url.searchParams.get("force") === "1"
  const forceDry = url.searchParams.get("dry") === "1"

  const invRes = await fetch(`${origin}/api/mos?endpoint=invoices/${encodeURIComponent(id)}`, {
    cache: "no-store",
  })
  if (!invRes.ok) {
    return Response.json({ error: `Invoice ${id} not found` }, { status: invRes.status })
  }
  const invoice = (await invRes.json()) as Invoice & { invoice_emailed_at?: string; client_email?: string }

  // Idempotency: don't re-send.
  if (invoice.invoice_emailed_at && !force) {
    return Response.json({ skipped: true, reason: "already_sent", emailed_at: invoice.invoice_emailed_at })
  }

  // `?to=` overrides the recipient — for testing only (e.g. your Resend account email).
  const to = url.searchParams.get("to") || invoice.client_email
  const apiKey = process.env.RESEND_API_KEY
  const sender = process.env.INVOICE_SENDER_EMAIL || "billing@prosper-mfg.com"
  const subject = `Invoice ${invoice.invoice_id} — Prosper Manufacturing`

  // Always render the PDF (this is the artifact we'd attach).
  const pdf = await renderInvoicePdf(invoice)
  const dryRun = !apiKey || forceDry

  if (!to) {
    return Response.json(
      { error: "no_recipient", message: "El cliente no tiene email registrado.", dryRun },
      { status: 400 },
    )
  }

  if (dryRun) {
    return Response.json({
      dryRun: true,
      reason: apiKey ? "forced_dry" : "no_api_key",
      to,
      subject,
      attachment: `invoice-${id}.pdf`,
      sizeKb: Math.round(pdf.length / 1024),
    })
  }

  // Real send via Resend HTTP API.
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0F172A">
      <h2 style="color:#0091D5">Invoice ${invoice.invoice_id}</h2>
      <p>Hello ${invoice.client || ""},</p>
      <p>Please find attached invoice <strong>#${invoice.invoice_id}</strong>
         for <strong>$${(invoice.amounts?.total ?? 0).toLocaleString()}</strong>,
         due ${invoice.dates?.due || "per terms"}.</p>
      <p>Thank you for your business.<br/>Prosper Manufacturing · Mos-atlas</p>
    </div>`

  const sendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: sender,
      to: [to],
      subject,
      html,
      attachments: [{ filename: `invoice-${id}.pdf`, content: pdf.toString("base64") }],
    }),
  })

  if (!sendRes.ok) {
    const detail = await sendRes.text().catch(() => "")
    return Response.json({ error: "send_failed", detail }, { status: 502 })
  }

  // Mark as emailed for idempotency.
  await fetch(`${origin}/api/mos?endpoint=invoices/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoice_emailed_at: new Date().toISOString() }),
  }).catch(() => {})

  return Response.json({ sent: true, to })
}
