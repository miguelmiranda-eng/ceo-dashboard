"use client"

import { useState } from "react"
import { Invoice } from "@/lib/api"
import { ZoomIn, ZoomOut, Download, ExternalLink, Printer } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { normalizeImageUrl } from "@/lib/api"

interface ProsperInvoiceProps { invoice: Invoice }

function ImageModal({ file, onClose }: { file: any; onClose: () => void }) {
  const [zoom, setZoom] = useState(1)
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-fit h-fit p-0 bg-slate-900 border-slate-800 overflow-hidden rounded-xl">
        <DialogHeader className="p-3 border-b border-slate-800 bg-slate-950 flex-row justify-between items-center space-y-0 gap-6">
          <DialogTitle className="text-white font-black uppercase tracking-widest text-xs truncate">{file.name}</DialogTitle>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(p => Math.max(0.5, p - 0.25))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ZoomOut className="h-3.5 w-3.5" /></button>
            <span className="text-[9px] text-slate-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(p => Math.min(5, p + 0.25))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ZoomIn className="h-3.5 w-3.5" /></button>
          </div>
          <a href={file.data || file.url} download={file.name} className="bg-blue-600 text-white px-3 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1"><Download className="h-2.5 w-2.5" />DL</a>
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

function QRCode() {
  return (
    <svg viewBox="0 0 21 21" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
      {/* TL block */}
      <rect x="1" y="1" width="7" height="7" fill="none" stroke="#000" strokeWidth="0.8"/>
      <rect x="2.5" y="2.5" width="4" height="4" fill="#000"/>
      {/* TR block */}
      <rect x="13" y="1" width="7" height="7" fill="none" stroke="#000" strokeWidth="0.8"/>
      <rect x="14.5" y="2.5" width="4" height="4" fill="#000"/>
      {/* BL block */}
      <rect x="1" y="13" width="7" height="7" fill="none" stroke="#000" strokeWidth="0.8"/>
      <rect x="2.5" y="14.5" width="4" height="4" fill="#000"/>
      {/* Data dots */}
      <rect x="9" y="1" width="1.5" height="1.5" fill="#000"/>
      <rect x="11" y="1" width="1.5" height="1.5" fill="#000"/>
      <rect x="9" y="3" width="1.5" height="1.5" fill="#000"/>
      <rect x="11" y="3" width="1.5" height="1.5" fill="#000"/>
      <rect x="9" y="5" width="1.5" height="1.5" fill="#000"/>
      <rect x="1" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="3" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="5" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="7" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="9" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="11" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="13" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="15" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="17" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="19" y="9" width="1.5" height="1.5" fill="#000"/>
      <rect x="9" y="11" width="1.5" height="1.5" fill="#000"/>
      <rect x="13" y="11" width="1.5" height="1.5" fill="#000"/>
      <rect x="15" y="11" width="1.5" height="1.5" fill="#000"/>
      <rect x="11" y="13" width="1.5" height="1.5" fill="#000"/>
      <rect x="15" y="13" width="1.5" height="1.5" fill="#000"/>
      <rect x="9" y="15" width="1.5" height="1.5" fill="#000"/>
      <rect x="13" y="15" width="1.5" height="1.5" fill="#000"/>
      <rect x="17" y="15" width="1.5" height="1.5" fill="#000"/>
      <rect x="9" y="17" width="1.5" height="1.5" fill="#000"/>
      <rect x="11" y="17" width="1.5" height="1.5" fill="#000"/>
      <rect x="15" y="17" width="1.5" height="1.5" fill="#000"/>
      <rect x="19" y="17" width="1.5" height="1.5" fill="#000"/>
      <rect x="13" y="19" width="1.5" height="1.5" fill="#000"/>
      <rect x="17" y="19" width="1.5" height="1.5" fill="#000"/>
    </svg>
  )
}

export function ProsperInvoice({ invoice }: ProsperInvoiceProps) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const inv = invoice as any

  const fmtDate = (d: any) => {
    if (!d) return "N/A"
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d }
  }

  const artLinks: string[] = Array.isArray(inv.art_links)
    ? inv.art_links.filter(Boolean)
    : typeof inv.art_links === 'string'
    ? inv.art_links.split('\n').filter(Boolean)
    : []

  const allAttachments: any[] = [
    ...(inv.production_attachments || []),
    ...(inv.items || []).flatMap((it: any) => it.attachments || [])
  ]
  const imageAttachments = allAttachments.filter(a => a?.type === 'image' || a?.mime?.startsWith('image/'))

  const sizeColumns: string[] = inv.size_columns || ["XS","S","M","L","XL","2XL","3XL","4XL"]

  return (
    <div id="prosper-production-sheet" className="bg-white text-[#0F172A] max-w-[1050px] mx-auto font-sans select-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Print button — screen only */}
      <div className="print:hidden flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-300">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">PROSPER PRODUCTION CONSOLE</span>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0F172A] text-white px-4 py-1.5 rounded text-[10px] font-black uppercase hover:bg-slate-700 transition-colors">
          <Printer className="h-3.5 w-3.5" /> Print Production Sheet
        </button>
      </div>

      <div className="p-6 space-y-0 text-[11px]">

        {/* ── 1. SMART HEADER ── */}
        <div className="text-center text-[10px] font-bold text-gray-500 mb-1">Cabecera de Identificación Rápida (Smart Header)</div>
        <table className="w-full border-collapse border border-gray-400 mb-4" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              {/* Logo + Contact */}
              <td className="border border-gray-400 p-3 align-top w-[28%]">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round">
                      <path d="M20 50 Q50 10 80 50 T80 90" />
                      <circle cx="50" cy="50" r="8" fill="white" stroke="none" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-black text-sm leading-tight">Prosper Manufacturing</div>
                    <div className="text-[9px] text-gray-500">Contact | #04ie Data</div>
                    <div className="text-[9px] text-gray-500">prospermfg.com</div>
                  </div>
                </div>
              </td>

              {/* WO + PO Center */}
              <td className="border border-gray-400 p-3 text-center align-middle w-[42%]">
                <div className="font-black text-3xl leading-tight tracking-tight">WORK ORDER: #{inv.invoice_id || "NEW"}</div>
                {inv.customer_po && <div className="font-black text-2xl tracking-tight">PO: #{inv.customer_po}</div>}
                {inv.client && <div className="text-sm font-bold text-gray-600 mt-1 uppercase">{inv.client}</div>}
              </td>

              {/* Dates + QR */}
              <td className="border border-gray-400 p-3 align-top w-[30%]">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 text-[10px]">
                    <div>
                      <span className="font-bold">Created: </span>
                      <span>{fmtDate(inv.dates?.created)}</span>
                    </div>
                    <div>
                      <span className="font-bold">| DUE DATE: </span>
                      <span className="font-black text-red-600 text-[11px]">{fmtDate(inv.dates?.due)}</span>
                    </div>
                    {inv.cancel_date && (
                      <div><span className="font-bold text-orange-600">CANCEL: </span><span className="font-black text-orange-600">{fmtDate(inv.cancel_date)}</span></div>
                    )}
                    <div className="text-[9px] text-gray-500 mt-2 font-bold">QR Code linking to<br/>Digital Packing List</div>
                  </div>
                  <div className="w-16 h-16 flex-shrink-0 border border-gray-300 p-0.5">
                    <QRCode />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── 2. ART PANEL ── */}
        <div className="flex gap-4 mb-3">
          <div className="border-2 border-blue-600 rounded p-3 w-[38%] flex-shrink-0">
            <div className="font-black text-[11px] text-blue-800 mb-2 underline">DEPARTAMENTO DE ARTE:</div>
            {artLinks.length > 0 ? artLinks.map((link, i) => {
              const labels = ["SEPS (Separaciones)", "TAGS (Etiquetas)", "TAGS DOBLES"]
              const label = labels[i] || `LINK ${i+1}`
              return (
                <div key={i} className="flex items-center gap-1 mb-1 text-[10px]">
                  <span className="font-black">• {label}: </span>
                  <a href={link} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 font-bold underline flex items-center gap-0.5 truncate hover:text-blue-800">
                    <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">[Clean Button/Link]</span>
                  </a>
                </div>
              )
            }) : (
              <div className="text-[10px] text-gray-400 italic">No art links</div>
            )}
            {inv.seps && <div className="text-[9px] text-gray-600 font-bold mt-1">SEPS: {inv.seps}</div>}
            <div className="text-[9px] font-bold text-gray-600 mt-2 border-t border-blue-200 pt-1">
              SOLO LINKS DE ARTE. SIN NOTAS ADICIONALES
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-black text-gray-400 mb-2">Panel de Activos Técnicos (Art &amp; Seps)</div>
              {inv.job_title_a?.url && (
                <a href={inv.job_title_a.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs font-bold underline break-all">{inv.job_title_a.url}</a>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. PRODUCTION MATRIX + CHECKLIST ── */}
        <div className="flex gap-3 mb-3">
          {/* Matrix (left, wider) */}
          <div className="flex-1">
            <div className="text-[10px] font-bold text-gray-600 mb-0.5">Matriz de Producción Principal</div>
            <div className="text-xl font-black mb-0.5">Cliente: {inv.client || "—"}</div>
            {inv.job_title_a?.desc && <div className="text-lg font-black mb-2">Art Name: {inv.job_title_a.desc}</div>}

            <table className="w-full border-collapse border border-gray-400 text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 py-1 px-2 text-left font-black whitespace-nowrap">Item / Estilo</th>
                  <th className="border border-gray-400 py-1 px-2 text-left font-black">Color / Descripción</th>
                  {sizeColumns.map(s => (
                    <th key={s} className="border border-gray-400 py-1 px-1 text-center font-black w-8">{s}</th>
                  ))}
                  <th className="border border-gray-400 py-1 px-2 text-center font-black">Total</th>
                </tr>
              </thead>
              <tbody>
                {(inv.items || []).map((item: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 py-1.5 px-2 font-bold whitespace-nowrap">{item.item_number || "—"}</td>
                    <td className="border border-gray-300 py-1.5 px-2 font-bold uppercase">{item.description || "—"}</td>
                    {sizeColumns.map(s => (
                      <td key={s} className="border border-gray-300 py-1.5 px-1 text-center font-bold">
                        {item.sizes?.[s] ? item.sizes[s] : <span className="text-gray-300">-</span>}
                      </td>
                    ))}
                    <td className="border border-gray-300 py-1.5 px-2 text-center font-black text-sm">{item.quantity || 0}</td>
                  </tr>
                ))}
              </tbody>
              {(inv.items || []).length > 0 && (
                <tfoot>
                  <tr className="bg-gray-200">
                    <td className="border border-gray-400 py-1 px-2 font-black" colSpan={2}>TOTAL</td>
                    {sizeColumns.map(s => {
                      const t = (inv.items || []).reduce((a: number, it: any) => a + (Number(it.sizes?.[s]) || 0), 0)
                      return <td key={s} className="border border-gray-400 py-1 px-1 text-center font-black">{t > 0 ? t : "—"}</td>
                    })}
                    <td className="border border-gray-400 py-1 px-2 text-center font-black text-sm">
                      {(inv.items || []).reduce((a: number, it: any) => a + (Number(it.quantity) || 0), 0)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>

            {/* Status + Production Note */}
            {inv.blank_status && (
              <div className="text-[10px] font-bold mt-1">Status: <span className="text-red-600">{inv.blank_status}</span></div>
            )}
            {inv.production_notes && (
              <div className="text-[10px] mt-0.5">
                <span className="font-black">Nota de Producción: </span>
                <span>{inv.production_notes}</span>
              </div>
            )}
          </div>

          {/* Checklist (right, narrow) */}
          <div className="w-[220px] flex-shrink-0 border border-gray-400 rounded p-3">
            <div className="font-black text-[11px] border-b border-gray-300 pb-1 mb-2">Checklist de Procesos y Acabados</div>
            <div className="space-y-1.5">
              {[
                { label: "Front Print", note: "(Según CAD)" },
                { label: "Neck Label", note: "(Etiqueta de cuello)" },
                { label: "Finishing", note: "(Acabado)" },
                { label: "Pick & Pack", note: "(Selección y empaque)" },
              ].map((it, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px]">
                  <div className="w-3.5 h-3.5 border border-gray-500 rounded-sm mt-0.5 flex-shrink-0 print:border-gray-600" />
                  <div><span className="font-black">{it.label}: </span><span className="text-gray-500">{it.note}</span></div>
                </div>
              ))}
            </div>
            <div className="text-[9px] mt-3 pt-2 border-t border-gray-200 text-gray-600">
              <span className="font-black">Método de Aprobación:</span> Seguir CAD y enviar foto para aprobación final
            </div>
          </div>
        </div>

        {/* ── 4. VISUAL ATTACHMENTS ── */}
        {imageAttachments.length > 0 && (
          <div className="border border-gray-300 rounded p-3 mb-3">
            <div className="font-black text-[11px] border-b border-gray-200 pb-1 mb-2">Adjuntos Visuales / Visual Attachments</div>
            <div className="flex flex-wrap gap-4">
              {imageAttachments.map((file: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => setSelectedImage(file)}>
                  <div className="relative border border-gray-300 bg-gray-50 overflow-hidden group-hover:border-blue-400 transition-colors" style={{ width: 72, height: 72 }}>
                    <img src={normalizeImageUrl(file.url || file.data)} alt={file.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-[8px] font-black uppercase text-gray-500 text-center max-w-[72px] truncate">{file.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. PACKING SPECS ── */}
        <div className="border border-gray-400 rounded p-3 bg-gray-50">
          <div className="font-black text-[12px] mb-1">Especificaciones de Empaque (Packing Dept)</div>
          <div className="text-[10px] mb-1">
            <span className="font-bold">Instrucciones de Doblado/Caja: </span>
            {inv.finishing_notes
              ? <span>{inv.finishing_notes}</span>
              : <span>Referenciadas en los adjuntos.</span>
            }
          </div>
          <div className="text-[10px]">
            <span className="font-black">Cantidades por Caja (Bulk): </span>
            <span>
              {sizeColumns.map(s => {
                const t = (inv.items || []).reduce((a: number, it: any) => a + (Number(it.sizes?.[s]) || 0), 0)
                return t > 0 ? `${s}: ${t}` : null
              }).filter(Boolean).join(' | ') || 'N/A'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200 text-[8px] text-gray-400 font-bold uppercase">
          <span>Prosper Manufacturing LLC — Production Control Document</span>
          <span>WO #{inv.invoice_id} · Printed: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {selectedImage && <ImageModal file={selectedImage} onClose={() => setSelectedImage(null)} />}

      <style>{`
        @media print {
          #prosper-production-sheet { max-width: 100%; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
