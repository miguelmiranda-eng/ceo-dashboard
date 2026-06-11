/**
 * Server-side invoice PDF (Mos-atlas branded) built with @react-pdf/renderer.
 * Used by the PDF download route and as the email attachment.
 * Runs on the Node runtime only (renderToBuffer is not edge-safe).
 */
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"
import type { Invoice } from "@/lib/api"

const BLUE = "#0091D5"
const DARK = "#0F172A"
const GRAY = "#64748B"
const LINE = "#E2E8F0"

const s = StyleSheet.create({
  page: { paddingHorizontal: 36, paddingVertical: 40, fontSize: 9, color: DARK, fontFamily: "Helvetica" },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 22, fontFamily: "Helvetica-Bold", color: DARK },
  brandSub: { fontSize: 8, letterSpacing: 2, color: BLUE, fontFamily: "Helvetica-Bold" },
  docType: { fontSize: 20, fontFamily: "Helvetica-Bold", color: BLUE, textAlign: "right" },
  muted: { color: GRAY },
  label: { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Helvetica-Bold" },
  value: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },
  hr: { borderBottomWidth: 1, borderBottomColor: LINE, marginVertical: 14 },
  box: { borderWidth: 1, borderColor: LINE, borderRadius: 4, padding: 10, flexGrow: 1 },
  th: { backgroundColor: DARK, color: "#fff", flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8 },
  thText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  td: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: LINE },
  tdText: { fontSize: 8.5 },
  totalsBox: { width: 200, alignSelf: "flex-end", marginTop: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, marginTop: 4, borderTopWidth: 2, borderTopColor: DARK },
  footer: { position: "absolute", bottom: 28, left: 36, right: 36, fontSize: 7.5, color: GRAY, textAlign: "center" },
})

const money = (n: number) =>
  `$${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function addr(a: any): string {
  if (!a) return ""
  if (typeof a === "string") return a
  return [a.street, a.city, a.state, a.zip].filter(Boolean).join(", ")
}

// Cell width flex weights: #, Description, Color, Qty, Price, Amount
const COLS = [1.5, 4, 1.5, 1, 1.5, 1.5]

function InvoicePdfDocument({ invoice }: { invoice: Invoice }) {
  const isQuote = invoice.type === "quote"
  const items = invoice.items || []
  const subtotal = invoice.amounts?.subtotal ?? items.reduce((x, i) => x + (Number(i.amount) || 0), 0)
  const tax = invoice.amounts?.tax ?? 0
  const total = invoice.amounts?.total ?? subtotal + tax

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.between}>
          <View>
            <Text style={s.brand}>MOS<Text style={{ color: BLUE }}>ATLAS</Text></Text>
            <Text style={s.brandSub}>PROSPER MANUFACTURING</Text>
            <Text style={[s.muted, { fontSize: 8, marginTop: 4 }]}>prospermfg.com</Text>
          </View>
          <View>
            <Text style={s.docType}>{isQuote ? "QUOTE" : "INVOICE"}</Text>
            <Text style={[s.value, { textAlign: "right", marginTop: 4 }]}>#{invoice.invoice_id || "—"}</Text>
          </View>
        </View>

        <View style={s.hr} />

        {/* Bill to + meta */}
        <View style={[s.row, { gap: 12 }]}>
          <View style={s.box}>
            <Text style={s.label}>Bill To</Text>
            <Text style={s.value}>{invoice.client || "—"}</Text>
            {!!addr(invoice.billing_address) && (
              <Text style={[s.muted, { marginTop: 3 }]}>{addr(invoice.billing_address)}</Text>
            )}
            {!!(invoice as any).client_email && (
              <Text style={[s.muted, { marginTop: 3 }]}>{(invoice as any).client_email}</Text>
            )}
          </View>
          <View style={[s.box, { maxWidth: 200 }]}>
            <View style={s.between}>
              <View>
                <Text style={s.label}>Invoice Date</Text>
                <Text style={s.value}>{invoice.dates?.created || "—"}</Text>
              </View>
              <View>
                <Text style={s.label}>Due</Text>
                <Text style={s.value}>{invoice.dates?.due || "—"}</Text>
              </View>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={s.label}>Terms</Text>
              <Text style={s.value}>{invoice.terms || "Net 30"}</Text>
            </View>
            {!!invoice.customer_po && (
              <View style={{ marginTop: 8 }}>
                <Text style={s.label}>PO #</Text>
                <Text style={s.value}>{invoice.customer_po}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items table */}
        <View style={{ marginTop: 18 }}>
          <View style={s.th}>
            <Text style={[s.thText, { flex: COLS[0] }]}>Item</Text>
            <Text style={[s.thText, { flex: COLS[1] }]}>Description</Text>
            <Text style={[s.thText, { flex: COLS[2] }]}>Color</Text>
            <Text style={[s.thText, { flex: COLS[3], textAlign: "right" }]}>Qty</Text>
            <Text style={[s.thText, { flex: COLS[4], textAlign: "right" }]}>Price</Text>
            <Text style={[s.thText, { flex: COLS[5], textAlign: "right" }]}>Amount</Text>
          </View>
          {items.length === 0 ? (
            <View style={s.td}><Text style={[s.tdText, s.muted]}>No line items.</Text></View>
          ) : (
            items.map((it, i) => (
              <View style={s.td} key={i} wrap={false}>
                <Text style={[s.tdText, { flex: COLS[0] }]}>{it.item_number || "—"}</Text>
                <Text style={[s.tdText, { flex: COLS[1] }]}>{it.description || "—"}</Text>
                <Text style={[s.tdText, { flex: COLS[2] }]}>{it.color || "—"}</Text>
                <Text style={[s.tdText, { flex: COLS[3], textAlign: "right" }]}>{Number(it.quantity) || 0}</Text>
                <Text style={[s.tdText, { flex: COLS[4], textAlign: "right" }]}>{money(it.price)}</Text>
                <Text style={[s.tdText, { flex: COLS[5], textAlign: "right" }]}>{money(it.amount)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.muted}>Subtotal</Text>
            <Text>{money(subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.muted}>Tax</Text>
            <Text>{money(tax)}</Text>
          </View>
          <View style={s.grandRow}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>TOTAL</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", color: BLUE }}>{money(total)}</Text>
          </View>
        </View>

        {!!invoice.production_notes && (
          <View style={{ marginTop: 20 }}>
            <Text style={s.label}>Notes</Text>
            <Text style={[s.muted, { marginTop: 3 }]}>{invoice.production_notes}</Text>
          </View>
        )}

        <Text style={s.footer} fixed>
          Prosper Manufacturing · Mos-atlas · prospermfg.com — {isQuote ? "Quotation" : "Invoice"} #{invoice.invoice_id}
        </Text>
      </Page>
    </Document>
  )
}

/** Render the invoice to a PDF Buffer (Node runtime only). */
export async function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return renderToBuffer(<InvoicePdfDocument invoice={invoice} />)
}
