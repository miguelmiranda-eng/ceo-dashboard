"use client"

import { useState, useEffect } from "react"
import { Save, X, Loader2, ZoomIn, ZoomOut, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Invoice, InvoiceItem, fetchOptions, normalizeImageUrl } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArtLinksPanel, SizeMatrixTable, AttachmentUploader } from "./InvoiceFormSections"

const DEFAULT_SIZES = ["XS","S","M","L","XL","2XL","3XL","4XL"]

function ImagePreviewModal({ file, onClose }: { file: any; onClose: () => void }) {
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

interface InvoiceFormProps {
  initialData?: Partial<Invoice>
  onSubmit: (data: Partial<Invoice>) => void
  onCancel: () => void
  isLoading?: boolean
}

export function InvoiceForm({ initialData, onSubmit, onCancel, isLoading = false }: InvoiceFormProps) {
  const inv = initialData as any
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const [options, setOptions] = useState<any>(null)

  const [form, setForm] = useState<any>({
    invoice_id: inv?.invoice_id,
    client: inv?.client || "",
    customer_po: inv?.customer_po || "",
    store_po: inv?.store_po || "",
    job_title_a: typeof inv?.job_title_a === 'string'
      ? { url: "", desc: inv.job_title_a }
      : (inv?.job_title_a || { url: "", desc: "" }),
    dates: {
      created: inv?.dates?.created || new Date().toISOString().split('T')[0],
      due: inv?.dates?.due || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
    },
    cancel_date: inv?.cancel_date || "",
    blank_status: inv?.blank_status || "PENDIENTE",
    artwork_status: inv?.artwork_status || "NEW",
    priority: inv?.priority || "PRIORITY 2",
    seps: inv?.seps || "",
    art_links: inv?.art_links || ["","",""],
    size_columns: inv?.size_columns || [...DEFAULT_SIZES],
    items: inv?.items?.length > 0
      ? inv.items.map((it: any) => ({ ...it, items_count: it.items_count || 0 }))
      : [{
          item_number: "", color: "", description: "",
          quantity: 0, price: 0, amount: 0, items_count: 0,
          sizes: DEFAULT_SIZES.reduce((a: any, s) => ({ ...a, [s]: 0 }), {})
        }],
    production_notes: inv?.production_notes || "",
    finishing_notes: inv?.finishing_notes || "",
    production_attachments: inv?.production_attachments || [],
    open_text_field: inv?.open_text_field || "",
  })

  useEffect(() => { fetchOptions().then(setOptions).catch(console.error) }, [])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const set = (field: string, val: any) => setForm((p: any) => ({ ...p, [field]: val }))

  const calcTotals = (items: any[]) => {
    const subtotal = items.reduce((s, it) => s + (it.amount || 0), 0)
    return { subtotal, tax: subtotal * 0.08, total: subtotal + subtotal * 0.08 }
  }

  const addItem = () => {
    const newItem = {
      item_number: "", color: "", description: "",
      quantity: 0, price: 0, amount: 0, items_count: 0,
      sizes: form.size_columns.reduce((a: any, s: string) => ({ ...a, [s]: 0 }), {})
    }
    setForm((p: any) => ({ ...p, items: [...p.items, newItem], amounts: calcTotals([...p.items, newItem]) }))
  }

  const removeItem = (i: number) => setForm((p: any) => {
    const items = p.items.filter((_: any, idx: number) => idx !== i)
    return { ...p, items, amounts: calcTotals(items) }
  })

  const updateItem = (idx: number, field: string, val: any) => setForm((p: any) => {
    const items = [...p.items]
    const item = { ...items[idx], [field]: val }
    item.amount = (Number(item.quantity) || 0) * (Number(item.price) || 0)
    items[idx] = item
    return { ...p, items, amounts: calcTotals(items) }
  })

  const updateSize = (idx: number, size: string, val: string) => setForm((p: any) => {
    const items = [...p.items]
    const item = { ...items[idx] }
    const sizes = { ...(item.sizes || {}), [size]: parseInt(val) || 0 }
    item.sizes = sizes
    item.quantity = Object.values(sizes).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number
    item.amount = item.quantity * (item.price || 0)
    items[idx] = item
    return { ...p, items, amounts: calcTotals(items) }
  })

  const addSizeColumn = () => {
    const name = prompt("Nombre de la nueva talla (ej: 5XL, Youth S):")
    if (!name) return
    const clean = name.toUpperCase().trim()
    if (form.size_columns.includes(clean)) return
    setForm((p: any) => ({
      ...p,
      size_columns: [...p.size_columns, clean],
      items: p.items.map((it: any) => ({ ...it, sizes: { ...it.sizes, [clean]: 0 } }))
    }))
  }

  const removeSizeColumn = (name: string) => {
    if (!confirm(`¿Eliminar columna "${name}"?`)) return
    setForm((p: any) => {
      const size_columns = p.size_columns.filter((c: string) => c !== name)
      return {
        ...p, size_columns,
        items: p.items.map((it: any) => {
          const sizes = { ...it.sizes }
          delete sizes[name]
          const qty = Object.values(sizes).reduce((a: any, b: any) => a + (Number(b) || 0), 0) as number
          return { ...it, sizes, quantity: qty, amount: qty * (it.price || 0) }
        })
      }
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        let fileToUpload: File | Blob = file
        if (file.type.startsWith('image/') && file.size > 800 * 1024) {
          const compressed = await new Promise<string>(resolve => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = e => {
              const img = new Image()
              img.src = e.target?.result as string
              img.onload = () => {
                const canvas = document.createElement('canvas')
                const max = 1000
                let w = img.width, h = img.height
                if (w > max) { h = h * max / w; w = max }
                if (h > max) { w = w * max / h; h = max }
                canvas.width = w; canvas.height = h
                canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
                resolve(canvas.toDataURL('image/jpeg', 0.5))
              }
            }
          })
          const res2 = await fetch(compressed)
          fileToUpload = await res2.blob()
        }
        fd.append('file', fileToUpload, file.name)
        const uploadRes = await fetch('/api/mos?endpoint=invoices/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error("Upload failed")
        const { url } = await uploadRes.json()
        const cleanPath = url.startsWith('/api/') ? url.replace('/api/', '') : url
        const proxyUrl = `/api/mos?endpoint=${cleanPath}`
        const att = { url: proxyUrl, name: file.name, type: file.type.startsWith('image/') ? 'image' : 'other', mime: file.type, data: "" }
        setForm((p: any) => ({ ...p, production_attachments: [...(p.production_attachments || []), att] }))
      }
    } catch { alert("Error al subir archivo") } finally { setIsUploading(false) }
  }

  const removeAttachment = (i: number) => setForm((p: any) => {
    const a = [...p.production_attachments]
    a.splice(i, 1)
    return { ...p, production_attachments: a }
  })

  const handleSave = () => {
    let art_links: string[] = []
    if (typeof form.art_links === 'string') art_links = form.art_links.split('\n').map((l: string) => l.trim()).filter(Boolean)
    else if (Array.isArray(form.art_links)) art_links = form.art_links.map((l: any) => String(l).trim()).filter(Boolean)
    onSubmit({ ...form, art_links })
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white text-[#0F172A] max-w-[1050px] mx-auto font-sans" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* Top bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-300">
        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">
          {form.invoice_id ? `Editar Orden #${form.invoice_id}` : "Nueva Orden de Producción"}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading || isUploading}
            className="h-8 px-4 text-[10px] font-black uppercase border-gray-300">
            <X className="h-3.5 w-3.5 mr-1" /> Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isUploading}
            className="h-8 px-4 text-[10px] font-black uppercase bg-[#0F172A] text-white hover:bg-slate-700">
            {isLoading || isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {isUploading ? "Subiendo..." : isLoading ? "Guardando..." : "Guardar Orden"}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4 text-[11px]">

        {/* ── SMART HEADER ── */}
        <table className="w-full border-collapse border border-gray-400" style={{ tableLayout: 'fixed' }}>
          <tbody>
            <tr>
              {/* Left: Logo */}
              <td className="border border-gray-400 p-3 align-top w-[28%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round">
                      <path d="M20 50 Q50 10 80 50 T80 90" />
                      <circle cx="50" cy="50" r="8" fill="white" stroke="none" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-black text-sm leading-tight">Prosper Manufacturing</div>
                    <div className="text-[9px] text-gray-500">prospermfg.com</div>
                  </div>
                </div>
                {/* Priority + Status badges */}
                <div className="flex flex-wrap gap-1">
                  <select value={form.priority} onChange={e => set("priority", e.target.value)}
                    className="text-[9px] font-black border border-amber-400 rounded px-1 bg-amber-50 text-amber-700 focus:outline-none">
                    {(options?.priorities || ["PRIORITY 1","PRIORITY 2","PRIORITY 3"]).map((p: string) =>
                      <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={form.artwork_status} onChange={e => set("artwork_status", e.target.value)}
                    className="text-[9px] font-black border border-blue-300 rounded px-1 bg-blue-50 text-blue-700 focus:outline-none">
                    {(options?.artwork_statuses || ["NEW","REORDER","APPROVED","PENDING"]).map((s: string) =>
                      <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </td>

              {/* Center: WO# + PO + Client */}
              <td className="border border-gray-400 p-3 text-center align-middle w-[42%] bg-gray-50">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Work Order</div>
                <div className="font-black text-3xl leading-tight tracking-tight text-gray-700">
                  #{form.invoice_id || <span className="text-gray-300">AUTO</span>}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-[9px] font-black text-gray-500">PO:</span>
                  <input value={form.customer_po} onChange={e => set("customer_po", e.target.value)}
                    placeholder="#19029"
                    className="text-xl font-black text-center border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none w-36 bg-transparent" />
                </div>
                <div className="mt-2">
                  <select value={form.client} onChange={e => set("client", e.target.value)}
                    className="text-sm font-bold text-center border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-400 uppercase bg-white">
                    <option value="">— Seleccionar Cliente —</option>
                    {(options?.clients || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-[10px] font-black text-[#0091D5] uppercase tracking-widest">Store PO #:</span>
                  <input value={form.store_po} onChange={e => set("store_po", e.target.value)}
                    placeholder="Store PO #"
                    className="text-sm font-black border-b border-[#0091D5] focus:border-blue-600 focus:outline-none w-40 bg-transparent text-[#0091D5]" />
                </div>
              </td>

              {/* Right: Dates */}
              <td className="border border-gray-400 p-3 align-top w-[30%]">
                <div className="space-y-2 text-[10px]">
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Created</div>
                    <input type="date" value={form.dates?.created || ""}
                      onChange={e => set("dates", { ...form.dates, created: e.target.value })}
                      className="border-b border-gray-300 focus:border-blue-400 focus:outline-none text-[10px] font-bold w-full bg-transparent" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Cancel Date</div>
                    <input type="date" value={form.cancel_date || ""}
                      onChange={e => set("cancel_date", e.target.value)}
                      className="border-b border-orange-300 focus:border-orange-500 focus:outline-none text-[10px] font-bold text-orange-600 w-full bg-transparent" />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── ART PANEL + Art Name ── */}
        <div className="flex gap-4">
          <div className="w-[38%] flex-shrink-0">
            <ArtLinksPanel
              artLinks={Array.isArray(form.art_links) ? form.art_links : (form.art_links || "").split('\n')}
              onChange={links => set("art_links", links)}
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-500 uppercase">SEPS #:</span>
              <input value={form.seps} onChange={e => set("seps", e.target.value)}
                placeholder="Separaciones"
                className="flex-1 text-[10px] border-b border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent font-mono" />
            </div>
          </div>
          <div className="flex-1 border border-gray-200 rounded p-3 bg-gray-50/50">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Art Name / Descripción del Arte</div>
            <input value={form.job_title_a?.desc || ""} onChange={e => set("job_title_a", { ...form.job_title_a, desc: e.target.value })}
              placeholder="HELL GRIP TEE - SATAN UNIVERSITY"
              className="w-full text-lg font-black uppercase border-b-2 border-gray-200 focus:border-blue-400 focus:outline-none bg-transparent mb-2" />
          </div>
        </div>

        {/* ── PRODUCTION MATRIX ── */}
        <div>
          <div className="text-[10px] font-bold text-gray-600 mb-0.5">Matriz de Producción Principal</div>
          <div className="text-base font-black mb-1 uppercase">
            Cliente: {form.client || <span className="text-gray-300">— seleccionar —</span>}
          </div>
          {form.job_title_a?.desc && (
            <div className="text-base font-black mb-2 uppercase">Art Name: {form.job_title_a.desc}</div>
          )}
          <div className="space-y-4">
            {/* Matrix */}
            <SizeMatrixTable
              items={form.items}
              sizeColumns={form.size_columns}
              onUpdateSize={updateSize}
              onUpdateItem={updateItem}
              onAddSize={addSizeColumn}
              onRemoveSize={removeSizeColumn}
              onAddItem={addItem}
              onRemoveItem={removeItem}
            />
            
            {/* Open Text Field */}
            <div className="mt-4">
              <div className="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-gray-200"></div>
                <span>CAMPO DE TEXTO ABIERTO</span>
                <div className="h-[1px] flex-1 bg-gray-200"></div>
              </div>
              <textarea 
                value={form.open_text_field || ""} 
                onChange={e => set("open_text_field", e.target.value)}
                placeholder="Ingrese información adicional aquí..."
                rows={4}
                className="w-full text-[12px] p-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none bg-white font-medium"
              />
            </div>

            {/* Checklist (Now below) */}
            <div className="border border-gray-400 rounded p-3 bg-gray-50/30">
              <div className="font-black text-[11px] border-b border-gray-300 pb-1 mb-2">Checklist de Procesos y Acabados</div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                {[
                  { label: "Front Print", note: "(Según CAD)" },
                  { label: "Neck Label", note: "(Etiqueta de cuello)" },
                  { label: "Finishing", note: "(Acabado)" },
                  { label: "Pick & Pack", note: "(Selección y empaque)" },
                ].map((it, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px]">
                    <div className="w-3.5 h-3.5 border border-gray-500 rounded-sm mt-0.5 flex-shrink-0" />
                    <div><span className="font-black">{it.label}: </span><span className="text-gray-500">{it.note}</span></div>
                  </div>
                ))}
              </div>
              <div className="text-[9px] mt-3 pt-2 border-t border-gray-200 text-gray-600">
                <span className="font-black">Método de Aprobación:</span> Seguir CAD y enviar foto para aprobación final
              </div>
            </div>
          </div>
        </div>

        {/* ── VISUAL ATTACHMENTS ── */}
        <AttachmentUploader
          attachments={form.production_attachments || []}
          onAdd={handleFileChange}
          onRemove={removeAttachment}
          onSelect={setSelectedImage}
          isUploading={isUploading}
        />

        {/* ── PACKING SPECS ── */}
        <div className="border border-gray-400 rounded p-3 bg-gray-50">
          <div className="font-black text-[12px] mb-2">Especificaciones de Empaque (Packing Dept)</div>
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-bold whitespace-nowrap mt-1">Instrucciones:</span>
            <textarea value={form.finishing_notes} onChange={e => set("finishing_notes", e.target.value)}
              placeholder="Instrucciones de doblado, cajas y empaque..."
              rows={2}
              className="flex-1 text-[10px] border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400 bg-white resize-none" />
          </div>
          <div className="text-[10px] mt-2">
            <span className="font-black">Cantidades por Caja (Bulk): </span>
            <span className="text-gray-600">
              {form.size_columns.map((s: string) => {
                const t = form.items.reduce((a: number, it: any) => a + (Number(it.sizes?.[s]) || 0), 0)
                return t > 0 ? `${s}: ${t}` : null
              }).filter(Boolean).join(' | ') || 'Se calculará automáticamente'}
            </span>
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel} disabled={isLoading || isUploading}
            className="h-9 px-6 text-[10px] font-black uppercase border-gray-300">
            <X className="h-3.5 w-3.5 mr-1" /> Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isUploading}
            className="h-9 px-8 text-[10px] font-black uppercase bg-[#0F172A] text-white hover:bg-slate-700 shadow-lg">
            {isLoading || isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {isUploading ? "Subiendo archivos..." : isLoading ? "Guardando..." : "Guardar Orden"}
          </Button>
        </div>
      </div>

      {selectedImage && <ImagePreviewModal file={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  )
}
