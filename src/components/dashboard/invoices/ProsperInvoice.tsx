"use client"

import { useState } from "react"
import { Invoice } from "@/lib/api"
import { ZoomIn, ZoomOut, Download, ExternalLink, Printer } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { normalizeImageUrl } from "@/lib/api"

interface ProsperInvoiceProps {
  invoice: Invoice
}

function ImageModal({ file, onClose }: { file: any; onClose: () => void }) {
  const [zoom, setZoom] = useState(1)
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-fit h-fit p-0 bg-slate-900 border-slate-800 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-950 flex-row justify-between items-center space-y-0 gap-8">
          <DialogTitle className="text-white font-black uppercase tracking-widest text-xs truncate">{file.name}</DialogTitle>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(p => Math.max(0.5, p - 0.25))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ZoomOut className="h-4 w-4" /></button>
            <span className="text-[10px] text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(p => Math.min(5, p + 0.25))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ZoomIn className="h-4 w-4" /></button>
          </div>
          <a href={file.data || file.url} download={file.name} className="bg-blue-600 text-white px-3 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1"><Download className="h-3 w-3" />DL</a>
        </DialogHeader>
        <div className="p-6 bg-slate-800 flex items-center justify-center min-h-[300px] overflow-auto max-h-[85vh]">
          <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
            <img src={normalizeImageUrl(file.data || file.url)} alt={file.name} className="max-w-[80vw] shadow-2xl rounded-lg" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Simple QR placeholder SVG
function QRPlaceholder({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 border-2 border-slate-700 rounded p-1 bg-white">
        <svg viewBox="0 0 21 21" className="w-full h-full">
          <rect width="9" height="9" x="1" y="1" fill="none" stroke="#000" strokeWidth="1"/>
          <rect width="3" height="3" x="3" y="3" fill="#000"/>
          <rect width="9" height="9" x="11" y="1" fill="none" stroke="#000" strokeWidth="1"/>
          <rect width="3" height="3" x="13" y="3" fill="#000"/>
          <rect width="9" height="9" x="1" y="11" fill="none" stroke="#000" strokeWidth="1"/>
          <rect width="3" height="3" x="3" y="13" fill="#000"/>
          <rect x="12" y="12" width="2" height="2" fill="#000"/>
          <rect x="15" y="12" width="2" height="2" fill="#000"/>
          <rect x="12" y="15" width="5" height="2" fill="#000"/>
          <rect x="18" y="12" width="2" height="5" fill="#000"/>
        </svg>
      </div>
      <span className="text-[7px] text-slate-500 font-bold uppercase text-center leading-tight">Digital<br/>Packing List</span>
    </div>
  )
}

export function ProsperInvoice({ invoice }: ProsperInvoiceProps) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const inv = invoice as any

  const fmtDate = (d: any) => {
    if (!d) return "N/A"
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return d }
  }

  // Collect all art links from art_links field
  const artLinks: string[] = Array.isArray(inv.art_links)
    ? inv.art_links.filter(Boolean)
    : typeof inv.art_links === 'string'
    ? inv.art_links.split('\n').filter(Boolean)
    : []

  // Collect all item attachments + production attachments
  const allAttachments: any[] = [
    ...(inv.production_attachments || []),
    ...(inv.items || []).flatMap((it: any) => it.attachments || [])
  ]
  const imageAttachments = allAttachments.filter(a => a?.type === 'image' || a?.mime?.startsWith('image/'))
  const docAttachments = allAttachments.filter(a => a?.type !== 'image' && !a?.mime?.startsWith('image/'))

  // Dynamic size columns
  const sizeColumns: string[] = inv.size_columns || ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"]

  // Parse packing quantities from finishing_notes if present
  const packingNotes: string = inv.finishing_notes || ""

  return (
    <div
      id="prosper-production-sheet"
      className="bg-white text-[#0F172A] max-w-[1100px] mx-auto font-sans text-sm print:shadow-none"
      style={{ fontFamily: "'Inter', 'Arial', sans-serif" }}
    >
      {/* ── PRINT BUTTON (screen only) ── */}
      <div className="print:hidden flex justify-end p-4 bg-slate-50 border-b border-slate-200">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#0091D5] text-white px-5 py-2 rounded-lg text-xs font-black uppercase hover:bg-[#0081C0] transition-colors"
        >
          <Printer className="h-4 w-4" /> Print Production Sheet
        </button>
      </div>

      <div className="p-8 space-y-5">

        {/* ══ 1. SMART HEADER ══ */}
        <div className="grid grid-cols-3 border-2 border-slate-800 rounded-lg overflow-hidden">
          {/* Left: Logo + Contact */}
          <div className="p-4 border-r border-slate-200 flex flex-col justify-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-6 h-6 text-white fill-none stroke-current" strokeWidth="8" strokeLinecap="round">
                  <path d="M20 50 Q50 10 80 50 T80 90" />
                  <circle cx="50" cy="50" r="8" fill="white" stroke="none" />
                </svg>
              </div>
              <div>
                <p className="font-black text-sm leading-tight">Prosper Manufacturing</p>
                <p className="text-[10px] text-[#0091D5] font-bold uppercase tracking-widest">LLC</p>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 space-y-0.5 pl-1">
              <p>+1 (813) 388-8603 | prospermfg.com</p>
              <p>600 Cleveland St, Suite 363 — Clearwater, FL</p>
            </div>
          </div>

          {/* Center: WO + PO */}
          <div className="p-4 flex flex-col items-center justify-center bg-slate-50 border-r border-slate-200">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Work Order</p>
            <p className="text-4xl font-black tracking-tight text-[#0F172A] leading-none">#{inv.invoice_id || "NEW"}</p>
            {inv.customer_po && (
              <p className="text-lg font-black text-[#0091D5] mt-1">PO: #{inv.customer_po}</p>
            )}
            {inv.store_po && (
              <p className="text-xs font-bold text-slate-400 mt-0.5">Store PO: {inv.store_po}</p>
            )}
          </div>

          {/* Right: Dates + QR */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Created</p>
                <p className="font-bold text-slate-700">{fmtDate(inv.dates?.created)}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</p>
                <p className="font-black text-red-600 text-base">{fmtDate(inv.dates?.due)}</p>
              </div>
              {inv.cancel_date && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cancel</p>
                  <p className="font-bold text-orange-500">{fmtDate(inv.cancel_date)}</p>
                </div>
              )}
            </div>
            <QRPlaceholder value={`https://prosper-mfg.com/wo/${inv.invoice_id}`} />
          </div>
        </div>

        {/* ══ 2. ART PANEL + CLIENT INFO ══ */}
        <div className="grid grid-cols-2 gap-4">
          {/* Art Panel */}
          <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50/40">
            <p className="text-xs font-black text-blue-700 uppercase tracking-widest mb-3">🎨 Departamento de Arte</p>
            <div className="space-y-2">
              {artLinks.length > 0 ? artLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase w-20 flex-shrink-0">
                    {i === 0 ? "SEPS" : i === 1 ? "TAGS" : i === 2 ? "TAGS DOBLES" : `LINK ${i+1}`}:
                  </span>
                  <a href={link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-0.5 rounded-full truncate max-w-[200px] transition-colors">
                    <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                    <span className="truncate">{link.split('/').pop() || link}</span>
                  </a>
                </div>
              )) : (
                <p className="text-[10px] text-slate-400 italic">No art links attached</p>
              )}
              {inv.seps && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase w-20 flex-shrink-0">SEPS #:</span>
                  <span className="text-[10px] font-bold text-slate-700">{inv.seps}</span>
                </div>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-blue-200">
              <p className="text-[9px] font-black text-slate-500 uppercase italic">
                Solo links de arte. Sin notas adicionales.
              </p>
            </div>
          </div>

          {/* Client + Operational Info */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</p>
              <p className="text-xl font-black text-[#0F172A] uppercase leading-tight">{inv.client || "—"}</p>
            </div>
            {inv.job_title_a?.desc && (
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Art Name</p>
                <p className="text-base font-black text-[#0091D5] uppercase">{inv.job_title_a.desc}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {inv.priority && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                  <span className="bg-amber-100 text-amber-700 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">{inv.priority}</span>
                </div>
              )}
              {inv.blank_status && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Blanks</p>
                  <span className="bg-slate-100 text-slate-700 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">{inv.blank_status}</span>
                </div>
              )}
              {inv.artwork_status && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Art Status</p>
                  <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">{inv.artwork_status}</span>
                </div>
              )}
              {inv.color && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Color</p>
                  <p className="font-bold text-slate-700 uppercase">{inv.color}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ 3. PRODUCTION MATRIX ══ */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-[#0F172A] text-white px-4 py-2 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest">Matriz de Producción Principal</p>
            <p className="text-[9px] text-slate-400 font-bold">
              {inv.client && <span className="text-white font-black mr-2">{inv.client}</span>}
              {inv.job_title_a?.desc && <span>{inv.job_title_a.desc}</span>}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="py-2 px-3 text-left font-black text-[9px] uppercase tracking-widest text-slate-600 whitespace-nowrap">Item / Estilo</th>
                  <th className="py-2 px-3 text-left font-black text-[9px] uppercase tracking-widest text-slate-600">Color / Descripción</th>
                  {sizeColumns.map(s => (
                    <th key={s} className="py-2 px-2 text-center font-black text-[9px] uppercase tracking-widest text-slate-600 w-10">{s}</th>
                  ))}
                  <th className="py-2 px-3 text-center font-black text-[9px] uppercase tracking-widest text-slate-600">Items</th>
                  <th className="py-2 px-3 text-center font-black text-[9px] uppercase tracking-widest text-[#0091D5]">Total</th>
                </tr>
              </thead>
              <tbody>
                {(inv.items || []).map((item: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <p className="font-black text-[#0F172A]">{item.item_number || "—"}</p>
                      {item.category && <p className="text-[9px] text-slate-400 font-bold uppercase">{item.category}</p>}
                    </td>
                    <td className="py-3 px-3 align-top">
                      <p className="font-bold text-[#0F172A] uppercase text-xs">{item.description || "—"}</p>
                      {item.color && <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">{item.color}</p>}
                    </td>
                    {sizeColumns.map(s => (
                      <td key={s} className="py-3 px-2 text-center font-black text-sm">
                        {item.sizes?.[s] || <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-center font-bold text-slate-500">
                      {item.items_count || "—"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-black text-lg text-[#0F172A]">{item.quantity || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#0F172A] text-white">
                  <td colSpan={2} className="py-2 px-3 font-black text-[10px] uppercase tracking-widest">Total General</td>
                  {sizeColumns.map(s => {
                    const total = (inv.items || []).reduce((sum: number, it: any) => sum + (Number(it.sizes?.[s]) || 0), 0)
                    return <td key={s} className="py-2 px-2 text-center font-black text-sm">{total > 0 ? total : "—"}</td>
                  })}
                  <td className="py-2 px-3 text-center font-bold text-slate-400">
                    {(inv.items || []).reduce((sum: number, it: any) => sum + (Number(it.items_count) || 0), 0) || "—"}
                  </td>
                  <td className="py-2 px-3 text-center font-black text-xl">
                    {(inv.items || []).reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Production Notes */}
          {inv.production_notes && (
            <div className="border-t border-slate-200 bg-amber-50/40 px-4 py-2">
              <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1">Nota de Producción</p>
              <p className="text-xs text-slate-700 font-medium italic">{inv.production_notes}</p>
            </div>
          )}
        </div>

        {/* ══ 4. CHECKLIST + PACKING ══ */}
        <div className="grid grid-cols-5 gap-4">
          {/* Checklist de Procesos */}
          <div className="col-span-2 border border-slate-200 rounded-lg p-4">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
              ✓ Checklist de Procesos y Acabados
            </p>
            <div className="space-y-2">
              {[
                { label: "Front Print", note: "Según CAD" },
                { label: "Neck Label", note: "Etiqueta de cuello" },
                { label: "Finishing", note: "Acabado" },
                { label: "Pick & Pack", note: "Selección y empaque" },
              ].map((item, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer group">
                  <div className="w-4 h-4 border-2 border-slate-400 rounded mt-0.5 flex-shrink-0 group-hover:border-[#0091D5] transition-colors print:border-slate-600" />
                  <div>
                    <span className="font-black text-xs text-[#0F172A]">{item.label}: </span>
                    <span className="text-[10px] text-slate-500">({item.note})</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <p className="text-[9px] font-bold text-slate-500 italic">
                <span className="font-black text-slate-700">Método de Aprobación:</span> Seguir CAD y enviar foto para aprobación final.
              </p>
            </div>
          </div>

          {/* Packing Specs */}
          <div className="col-span-3 border border-slate-200 rounded-lg p-4">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
              📦 Especificaciones de Empaque (Packing Dept)
            </p>
            {packingNotes ? (
              <div className="space-y-2">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Instrucciones de Doblado/Caja:</p>
                  <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{packingNotes}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-500">
                <p><span className="font-black text-slate-700">Instrucciones de Doblado/Caja:</span> Referenciadas en los adjuntos.</p>
                <div>
                  <p className="font-black text-slate-700 mb-1">Cantidades por Caja (Bulk):</p>
                  <div className="flex flex-wrap gap-2">
                    {sizeColumns.slice(0, 6).map(s => {
                      const total = (inv.items || []).reduce((sum: number, it: any) => sum + (Number(it.sizes?.[s]) || 0), 0)
                      return total > 0 ? (
                        <span key={s} className="bg-slate-100 font-black text-slate-700 px-2 py-0.5 rounded text-[10px]">
                          {s}: {total}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* Doc Attachments */}
            {docAttachments.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Documentos Adjuntos:</p>
                <div className="flex flex-wrap gap-2">
                  {docAttachments.map((f, i) => (
                    <a key={i} href={f.url || f.data} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-slate-100 text-slate-600 font-bold text-[9px] px-2 py-0.5 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Download className="h-2.5 w-2.5" />{f.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ 5. VISUAL ATTACHMENTS ══ */}
        {imageAttachments.length > 0 && (
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">
              🖼 Adjuntos Visuales / Visual Attachments
            </p>
            <div className="flex flex-wrap gap-4">
              {imageAttachments.map((file: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-1 cursor-pointer group"
                  onClick={() => setSelectedImage(file)}>
                  <div className="w-20 h-20 border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50 group-hover:border-[#0091D5] transition-colors relative shadow-sm">
                    <img src={normalizeImageUrl(file.url || file.data)} alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-[#0091D5]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-[8px] font-black text-slate-500 uppercase text-center max-w-[80px] truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ FOOTER ══ */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          <span>Prosper Manufacturing LLC — Production Control Document</span>
          <span>WO #{inv.invoice_id} · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {selectedImage && <ImageModal file={selectedImage} onClose={() => setSelectedImage(null)} />}

      {/* Print styles */}
      <style>{`
        @media print {
          #prosper-production-sheet { max-width: 100%; padding: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
