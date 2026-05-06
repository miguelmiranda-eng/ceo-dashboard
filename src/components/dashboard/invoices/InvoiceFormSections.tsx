"use client"
import { ExternalLink, Plus, X, ZoomIn, Upload } from "lucide-react"
import { normalizeImageUrl } from "@/lib/api"

// ─── Art Links Panel ────────────────────────────────────────────────────────
export function ArtLinksPanel({ artLinks, onChange }: { artLinks: string[]; onChange: (links: string[]) => void }) {
  const labels = ["SEPS (Separaciones)", "TAGS (Etiquetas)", "TAGS DOBLES"]
  const update = (i: number, v: string) => { const n = [...artLinks]; n[i] = v; onChange(n) }
  const add = () => onChange([...artLinks, ""])
  const remove = (i: number) => { const n = [...artLinks]; n.splice(i, 1); onChange(n) }

  return (
    <div className="border-2 border-blue-600 rounded p-3 bg-blue-50/30">
      <div className="font-black text-[11px] text-blue-800 mb-2 underline">DEPARTAMENTO DE ARTE:</div>
      <div className="space-y-1.5">
        {artLinks.map((link, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="text-[9px] font-black text-gray-600 w-28 flex-shrink-0">• {labels[i] || `LINK ${i+1}`}:</span>
            <input
              value={link}
              onChange={e => update(i, e.target.value)}
              placeholder="https://..."
              className="flex-1 text-[10px] font-mono border border-blue-300 rounded px-1.5 py-0.5 bg-white text-blue-700 focus:outline-none focus:border-blue-500"
            />
            {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><ExternalLink className="h-3 w-3" /></a>}
            {i >= 3 && <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-blue-200">
        <span className="text-[9px] font-bold text-gray-500 italic">SOLO LINKS DE ARTE. SIN NOTAS ADICIONALES</span>
        <button onClick={add} className="text-[9px] font-black text-blue-600 flex items-center gap-0.5 hover:text-blue-800">
          <Plus className="h-3 w-3" /> Agregar
        </button>
      </div>
    </div>
  )
}

// ─── Size Matrix Row ────────────────────────────────────────────────────────
export function SizeMatrixTable({
  items, sizeColumns, onUpdateSize, onUpdateItem, onAddSize, onRemoveSize, onAddItem, onRemoveItem
}: {
  items: any[]; sizeColumns: string[];
  onUpdateSize: (idx: number, size: string, val: string) => void;
  onUpdateItem: (idx: number, field: string, val: any) => void;
  onAddSize: () => void; onRemoveSize: (s: string) => void;
  onAddItem: () => void; onRemoveItem: (i: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-400 text-[10px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 py-1 px-2 text-left font-black whitespace-nowrap w-20">Item / Estilo</th>
            <th className="border border-gray-400 py-1 px-2 text-left font-black">Color / Descripción</th>
            {sizeColumns.map(s => (
              <th key={s} className="border border-gray-400 py-1 px-1 text-center font-black w-10 relative group">
                <span>{s}</span>
                <button onClick={() => onRemoveSize(s)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-2 w-2" />
                </button>
              </th>
            ))}
            <th className="border border-gray-400 py-1 px-1 text-center font-black w-10">Items</th>
            <th className="border border-gray-400 py-1 px-2 text-center font-black w-12">Total</th>
            <th className="border border-gray-300 py-1 px-1 w-6 bg-blue-50">
              <button onClick={onAddSize} title="Add size" className="text-blue-600 hover:text-blue-800 font-black text-[10px]">+S</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-gray-300 py-1 px-1">
                <input value={item.item_number || ""} onChange={e => onUpdateItem(idx, "item_number", e.target.value)}
                  placeholder="gi5000" className="w-full text-[10px] font-bold bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none uppercase" />
              </td>
              <td className="border border-gray-300 py-1 px-1">
                <input value={item.description || ""} onChange={e => onUpdateItem(idx, "description", e.target.value)}
                  placeholder="Descripción del arte" className="w-full text-[10px] font-bold bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none uppercase" />
                {item.color !== undefined && (
                  <input value={item.color || ""} onChange={e => onUpdateItem(idx, "color", e.target.value)}
                    placeholder="Color" className="w-full text-[9px] text-gray-500 bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none mt-0.5" />
                )}
              </td>
              {sizeColumns.map(s => (
                <td key={s} className="border border-gray-300 py-1 px-1 text-center">
                  <input
                    type="text" inputMode="numeric"
                    value={item.sizes?.[s] || ""}
                    onChange={e => onUpdateSize(idx, s, e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full text-center text-[11px] font-black bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none"
                  />
                </td>
              ))}
              <td className="border border-gray-300 py-1 px-1 text-center">
                <input type="number" value={item.items_count || ""} onChange={e => onUpdateItem(idx, "items_count", parseInt(e.target.value) || 0)}
                  className="w-full text-center text-[10px] font-bold bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none" />
              </td>
              <td className="border border-gray-300 py-1 px-2 text-center font-black text-sm">{item.quantity || 0}</td>
              <td className="border border-gray-300 py-1 px-1 text-center">
                {idx > 0 && (
                  <button onClick={() => onRemoveItem(idx)} className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-200">
            <td className="border border-gray-400 py-1 px-2 font-black" colSpan={2}>
              <button onClick={onAddItem} className="text-blue-700 font-black text-[9px] flex items-center gap-0.5 hover:text-blue-900">
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </td>
            {sizeColumns.map(s => {
              const t = items.reduce((a, it) => a + (Number(it.sizes?.[s]) || 0), 0)
              return <td key={s} className="border border-gray-400 py-1 px-1 text-center font-black">{t > 0 ? t : "—"}</td>
            })}
            <td className="border border-gray-400 py-1 px-1 text-center font-bold text-gray-500">
              {items.reduce((a, it) => a + (Number(it.items_count) || 0), 0) || "—"}
            </td>
            <td className="border border-gray-400 py-1 px-2 text-center font-black text-sm">
              {items.reduce((a, it) => a + (Number(it.quantity) || 0), 0)}
            </td>
            <td className="border border-gray-400" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── Attachment Uploader ────────────────────────────────────────────────────
export function AttachmentUploader({
  attachments, onAdd, onRemove, onSelect, isUploading
}: {
  attachments: any[]; onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void; onSelect: (f: any) => void; isUploading: boolean;
}) {
  const images = attachments.filter(a => a?.type === 'image' || a?.mime?.startsWith('image/'))
  const docs = attachments.filter(a => !(a?.type === 'image' || a?.mime?.startsWith('image/')))

  return (
    <div className="border border-gray-300 rounded p-3 bg-gray-50">
      <div className="font-black text-[11px] border-b border-gray-200 pb-1 mb-2">Adjuntos Visuales / Visual Attachments</div>
      <div className="flex flex-wrap gap-3 mb-2">
        {images.map((f, i) => (
          <div key={i} className="relative group cursor-pointer" onClick={() => onSelect(f)}>
            <div className="w-16 h-16 border border-gray-300 bg-white overflow-hidden">
              <img src={normalizeImageUrl(f.url || f.data)} alt={f.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="h-4 w-4 text-white" />
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); onRemove(i) }}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-2.5 w-2.5" />
            </button>
            <div className="text-[7px] font-bold text-gray-500 text-center mt-0.5 max-w-[64px] truncate uppercase">{f.name}</div>
          </div>
        ))}
        {docs.map((f, i) => (
          <div key={`d${i}`} className="relative group flex flex-col items-center">
            <div className="w-16 h-16 border border-gray-300 bg-white flex items-center justify-center text-[8px] font-black text-gray-500 uppercase text-center p-1 break-all">{f.name}</div>
            <button onClick={() => onRemove(images.length + i)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        <label className="w-16 h-16 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors rounded">
          <Upload className="h-4 w-4 text-gray-400" />
          <span className="text-[8px] font-bold text-gray-400 mt-0.5">{isUploading ? "..." : "Upload"}</span>
          <input type="file" multiple accept="image/*,.pdf,.xlsx,.xls,.csv" onChange={onAdd} className="hidden" disabled={isUploading} />
        </label>
      </div>
    </div>
  )
}
