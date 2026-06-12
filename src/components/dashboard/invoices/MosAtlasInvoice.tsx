"use client"

import { useState } from "react"
import { Invoice } from "@/lib/api"
import { ZoomIn, ZoomOut, Download, Printer, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { normalizeImageUrl } from "@/lib/api"

interface MosAtlasInvoiceProps {
  invoice: Invoice;
  showFinancials?: boolean;
}
function ImageModal({ file, onClose }: { file: any; onClose: () => void }) {
  const [zoom, setZoom] = useState(1)
  const isPdf = file.mime === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className={`p-0 bg-slate-900 border-slate-800 overflow-hidden rounded-xl shadow-2xl transition-all ${isPdf ? 'max-w-[90vw] w-[90vw] h-[90vh]' : 'max-w-[95vw] w-fit h-fit'}`}>
        <DialogHeader className="p-3 border-b border-slate-800 bg-slate-950 flex-row justify-between items-center space-y-0 gap-6">
          <DialogTitle className="text-white font-black uppercase tracking-widest text-xs truncate">{file.name}</DialogTitle>
          <DialogDescription className="sr-only">Visualización de adjunto técnico para la orden de producción.</DialogDescription>
          <div className="flex items-center gap-1">
            {!isPdf && (
              <>
                <button onClick={() => setZoom(p => Math.max(0.5, p - 0.25))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ZoomOut className="h-3.5 w-3.5" /></button>
                <span className="text-[9px] text-slate-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(p => Math.min(5, p + 0.25))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ZoomIn className="h-3.5 w-3.5" /></button>
              </>
            )}
          </div>
          <a href={file.data || file.url} download={file.name} className="bg-blue-600 text-white px-3 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1"><Download className="h-2.5 w-2.5" />DL</a>
        </DialogHeader>
        <div className={`bg-slate-800 flex items-center justify-center overflow-auto ${isPdf ? 'h-[calc(90vh-45px)] w-full p-0' : 'p-6 min-h-[300px] max-h-[85vh]'}`}>
          <div style={{ 
            transform: isPdf ? 'none' : `scale(${zoom})`, 
            transition: 'transform 0.2s', 
            width: isPdf ? '100%' : 'auto', 
            height: isPdf ? '100%' : 'auto' 
          }}>
            {isPdf ? (
              <iframe 
                src={normalizeImageUrl(file.url || file.data)} 
                className="w-full h-full border-none bg-white"
                title={file.name}
              />
            ) : (
              <img src={normalizeImageUrl(file.data || file.url)} alt={file.name} className="max-w-[80vw] mx-auto shadow-2xl rounded-lg" />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MosAtlasInvoice({ invoice, showFinancials = false }: MosAtlasInvoiceProps) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const inv = invoice as any

  const sizeColumns: string[] = inv.size_columns || ["XS","S","M","L","XL","2XL","3XL","4XL"]
  
  const artLinks = Array.isArray(inv.art_links) 
    ? inv.art_links.map((al: any) => {
        if (typeof al === 'string' && al.includes('|')) {
          const [l, u] = al.split('|')
          return { label: l, url: u }
        }
        return typeof al === 'string' ? { label: "", url: al } : (al || { label: "", url: "" })
      })
    : []

  const visualAttachments = (inv.production_attachments || []).filter((a: any) => 
    a?.type === 'image' || a?.mime?.startsWith('image/') || a?.type === 'pdf' || a?.mime === 'application/pdf' || a?.name?.toLowerCase().endsWith('.pdf')
  )

  return (
    <div id="prosper-production-sheet" className="bg-white text-[#0F172A] max-w-[1400px] mx-auto font-sans" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      
      {/* Top bar (Screen only) */}
      <div className="print:hidden flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-300">
        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">
          Vista de Impresión: Orden #{inv.invoice_id}
        </span>
        <button onClick={() => window.print()} className="h-8 px-4 text-[10px] font-black uppercase bg-[#0F172A] text-white hover:bg-slate-700 flex items-center gap-1.5 rounded">
          <Printer className="h-3.5 w-3.5" /> Imprimir Hoja de Piso
        </button>
      </div>

      <div className="p-6 space-y-4 text-[11px]">

        {/* ── SMART HEADER (Mirrored from InvoiceForm) ── */}
        <table className="w-full border-collapse border border-gray-400" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              {/* Left: Logo + Badges */}
              <td className="border border-gray-400 p-3 align-top w-[28%]">
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/prosper_logo.jpg" alt="Prosper Manufacturing" className="h-9 w-auto max-w-full object-contain" />
                  <div className="text-[9px] text-gray-500 mt-1">prospermfg.com</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[9px] font-black border border-amber-400 rounded px-1 bg-amber-50 text-amber-700 uppercase">{inv.priority}</span>
                  <span className="text-[9px] font-black border border-blue-300 rounded px-1 bg-blue-50 text-blue-700 uppercase">{inv.artwork_status}</span>
                  <span className="text-[9px] font-black border border-emerald-300 rounded px-1 bg-emerald-50 text-emerald-700 uppercase">{inv.sample}</span>
                </div>
              </td>

              {/* Center: WO# + PO + Client */}
              <td className="border border-gray-400 p-3 text-center align-middle w-[42%] bg-gray-50">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Work Order</div>
                <div className="font-black text-3xl leading-tight tracking-tight text-gray-700">
                  #{inv.invoice_id || "AUTO"}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-[9px] font-black text-gray-500">PO:</span>
                  <span className="text-xl font-black text-center w-36 uppercase">{inv.customer_po || "—"}</span>
                </div>
                <div className="mt-2 text-sm font-bold uppercase">{inv.client || "—"}</div>
                {inv.store_po && (
                  <div className="mt-2 text-[10px] font-black text-[#0091D5] uppercase tracking-widest">
                    Store PO #: {inv.store_po}
                  </div>
                )}
              </td>

              {/* Right: Dates */}
              <td className="border border-gray-400 p-3 align-top w-[30%]">
                <div className="space-y-2 text-[10px]">
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Created</div>
                    <div className="text-[10px] font-bold">{inv.dates?.created || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Cancel Date</div>
                    <div className="text-[10px] font-bold text-orange-600">{inv.cancel_date || "—"}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── ART PANEL + Art Name ── */}
        <div className="flex gap-4">
          <div className="w-[38%] flex-shrink-0">
            <div className="border border-gray-300 rounded p-3 bg-gray-50">
              <div className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Art Links / Technical Assets</div>
              <div className="space-y-1.5">
                {artLinks.map((al: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-black text-gray-600 uppercase w-24 flex-shrink-0">{al.label || `LINK ${i+1}`}:</span>
                    <a 
                      href={al.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold underline truncate text-[9px] hover:text-blue-800 transition-colors"
                    >
                      {al.url || "N/A"}
                    </a>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-500 uppercase">SEPS #:</span>
                <span className="text-[10px] font-mono font-bold uppercase">{inv.seps || "—"}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 border border-gray-200 rounded p-3 bg-gray-50/50">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Art Style / Descripción del Estilo</div>
            <div className="text-lg font-black uppercase text-gray-700">{inv.job_title_a?.desc || "—"}</div>
          </div>
        </div>

        {/* ── PRODUCTION MATRIX ── */}
        <div>
          <div className="text-[10px] font-bold text-gray-600 mb-0.5">Matriz de Producción Principal</div>
          <table className="w-full border-collapse border border-gray-400 text-[10px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border border-gray-400 py-1 px-2 text-left font-black w-20">Item / Estilo</th>
                <th className="border border-gray-400 py-1 px-2 text-left font-black w-24">Color</th>
                <th className="border border-gray-400 py-1 px-2 text-left font-black">Descripción</th>
                {sizeColumns.map(s => (
                  <th key={s} className="border border-gray-400 py-1 px-1 text-center font-black w-10">{s}</th>
                ))}
                <th className="border border-gray-400 py-1 px-2 text-center font-black w-12">Total</th>
                {showFinancials && (
                  <>
                    <th className="border border-gray-400 py-1 px-2 text-center font-black w-16">Price</th>
                    <th className="border border-gray-400 py-1 px-2 text-center font-black w-16">Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(inv.items || []).map((item: any, idx: number) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 py-1.5 px-2 font-bold whitespace-pre-wrap">{item.item_number || "—"}</td>
                  <td className="border border-gray-300 py-1.5 px-2 font-bold uppercase whitespace-pre-wrap">{item.color || "—"}</td>
                  <td className="border border-gray-300 py-1.5 px-2 font-bold uppercase whitespace-pre-wrap">{item.description || "—"}</td>
                  {item.has_sizes === false ? (
                    <td colSpan={sizeColumns.length} className="border border-gray-300 py-1.5 px-2 text-center italic text-gray-500 bg-gray-50/60">
                      Sin tallas — Caja / Extra
                    </td>
                  ) : (
                    sizeColumns.map(s => (
                      <td key={s} className="border border-gray-300 py-1.5 px-1 text-center font-black">
                        {item.sizes?.[s] || "—"}
                      </td>
                    ))
                  )}
                  <td className="border border-gray-300 py-1.5 px-2 text-center font-black text-sm">{item.quantity || 0}</td>
                  {showFinancials && (
                    <>
                      <td className="border border-gray-300 py-1.5 px-2 text-right font-bold">${(item.price || 0).toFixed(2)}</td>
                      <td className="border border-gray-300 py-1.5 px-2 text-right font-black">${(item.amount || 0).toFixed(2)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            {showFinancials && (
              <tfoot>
                <tr className="bg-gray-200 font-black">
                  <td className="border border-gray-400 py-1 px-2" colSpan={sizeColumns.length + 4} />
                  <td className="border border-gray-400 py-1 px-2 text-right text-sm">
                    ${(inv.items || []).reduce((a: number, it: any) => a + (Number(it.amount) || 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* ── OPEN TEXT FIELD ── */}
        {inv.open_text_field && (
          <div className="mt-4 border border-gray-300 rounded p-4 bg-white">
            <div className="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-gray-200"></div>
              <span>CAMPO DE TEXTO ABIERTO</span>
              <div className="h-[1px] flex-1 bg-gray-200"></div>
            </div>
            <div className="text-[12px] font-medium leading-relaxed whitespace-pre-wrap">
              {inv.open_text_field}
            </div>
          </div>
        )}

        {/* ── CAMPOS DE TEXTO ADICIONALES ── */}
        {Array.isArray(inv.custom_fields) && inv.custom_fields.map((cf: any, i: number) => (
          (cf.title || cf.content) && (
            <div key={i} className="mt-4 border border-gray-300 rounded p-4 bg-white">
              <div className="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-gray-200"></div>
                <span>{cf.title || "CAMPO DE TEXTO ABIERTO"}</span>
                <div className="h-[1px] flex-1 bg-gray-200"></div>
              </div>
              <div className="text-[12px] font-medium leading-relaxed whitespace-pre-wrap">
                {cf.content}
              </div>
            </div>
          )
        ))}

        {/* ── FINANCIAL SUMMARY (Billing only) ── */}
        {showFinancials && (
          <div className="flex justify-end">
            <div className="w-[280px] bg-slate-50 border border-gray-300 rounded p-4 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                <span>Subtotal:</span>
                <span className="text-gray-700">${(inv.amounts?.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                <span>Sales Tax (0%):</span>
                <span className="text-gray-700">$0.00</span>
              </div>
              <div className="pt-2 border-t border-gray-300 flex justify-between items-end">
                <span className="text-[10px] font-black text-[#0091D5] uppercase tracking-widest">Total Amount:</span>
                <span className="text-xl font-black text-gray-800">${(inv.amounts?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKLIST (Mirrored from InvoiceForm) ── */}
        <div className="border border-gray-400 rounded p-3 bg-gray-50/30">
          <div className="font-black text-[11px] border-b border-gray-300 pb-1 mb-2 uppercase">Checklist de Procesos y Acabados</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {(inv.checklist_items || []).map((it: any, i: number) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px]">
                <div className={`w-3.5 h-3.5 border border-gray-500 rounded-sm mt-0.5 flex-shrink-0 flex items-center justify-center ${it.checked ? 'bg-gray-200' : ''}`}>
                  {it.checked && <Check className="h-2.5 w-2.5 text-gray-800" />}
                </div>
                <div>
                  <span className="font-black uppercase">{it.label}: </span>
                  <span className="text-gray-500">{it.note}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[9px] mt-3 pt-2 border-t border-gray-200 text-gray-600">
            <span className="font-black">Método de Aprobación:</span> {inv.approval_method || "Seguir CAD y enviar foto para aprobación final"}
          </div>
        </div>

        {/* ── VISUAL ATTACHMENTS ── */}
        {visualAttachments.length > 0 && (
          <div className="border border-gray-300 rounded p-3 bg-gray-50/30">
            <div className="font-black text-[11px] border-b border-gray-200 pb-1 mb-2 uppercase tracking-widest">MOCKUPS / CADS</div>
            <div className="flex flex-wrap gap-4">
              {visualAttachments.map((file: any, i: number) => {
                const isPdf = file.mime === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
                return (
                  <div key={i} className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => setSelectedImage(file)}>
                    <div className="relative border border-gray-300 bg-white overflow-hidden group-hover:border-blue-400 transition-colors" style={{ width: 72, height: 72 }}>
                      {isPdf ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-600">
                          <span className="text-[20px]">📄</span>
                          <span className="text-[8px] font-black mt-1">PDF</span>
                        </div>
                      ) : (
                        <img src={normalizeImageUrl(file.url || file.data)} alt={file.name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-[8px] font-black uppercase text-gray-500 text-center max-w-[72px] truncate">{file.name}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PACKING SPECS (Mirrored from InvoiceForm) ── */}
        <div className="border border-gray-400 rounded p-3 bg-gray-50">
          <div className="font-black text-[12px] mb-2 uppercase tracking-widest border-b border-gray-200 pb-1">Especificaciones de Empaque (Packing Dept)</div>
          <div className="flex items-start gap-2 mb-3">
            <span className="text-[10px] font-bold whitespace-nowrap">Instrucciones:</span>
            <div className="text-[10px] font-medium leading-tight whitespace-pre-wrap flex-1">{inv.finishing_notes || "N/A"}</div>
          </div>

          {inv.packing_attachments && inv.packing_attachments.length > 0 && (
            <div className="mb-3">
              <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Adjuntos de Empaque (Guías, Etiquetas, PDF)</div>
              <div className="flex flex-wrap gap-3">
                {inv.packing_attachments.map((f: any, i: number) => {
                   const isImg = f.type === 'image' || f.mime?.startsWith('image/')
                   const isPdf = f.type === 'pdf' || f.mime === 'application/pdf' || f.name?.toLowerCase().endsWith('.pdf')
                   return (
                    <div key={i} className="relative group cursor-pointer" onClick={() => (isImg || isPdf) && setSelectedImage(f)}>
                      <div className="w-16 h-16 border border-gray-300 bg-white flex items-center justify-center text-[8px] font-black text-gray-500 uppercase text-center p-1 break-all overflow-hidden group-hover:border-blue-400">
                        {isImg ? (
                          <img src={normalizeImageUrl(f.url || f.data)} alt={f.name} className="w-full h-full object-cover" />
                        ) : isPdf ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xl">📄</span>
                            <span className="mt-1 text-red-600">PDF</span>
                          </div>
                        ) : (
                          <span>{f.name}</span>
                        )}
                      </div>
                      <div className="text-[7px] font-bold text-gray-400 text-center mt-0.5 max-w-[64px] truncate uppercase">{f.name}</div>
                    </div>
                   )
                })}
              </div>
            </div>
          )}

        </div>

        {/* Print Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">
          <span>Prosper Manufacturing — Production Control Document</span>
          <span>WO #{inv.invoice_id} · Printed: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {selectedImage && <ImageModal file={selectedImage} onClose={() => setSelectedImage(null)} />}

      <style jsx>{`
        @media print {
          #prosper-production-sheet { max-width: 100%; border: none; }
          .p-6 { padding: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .border-gray-400 { border-color: #9ca3af !important; }
        }
      `}</style>
    </div>
  )
}
