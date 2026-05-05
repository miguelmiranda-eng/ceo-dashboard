"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Save,
  X,
  Link as LinkIcon,
  MapPin,
  ClipboardList,
  Scissors,
  Workflow,
  FileUp,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText as FilePdf,
  Paperclip,
  Loader2,
  ZoomIn,
  ZoomOut,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Invoice, InvoiceItem, fetchOptions, normalizeImageUrl, normalizePublicUrl } from "@/lib/api"
import { cn } from "@/lib/utils"

interface InvoiceFormProps {
  initialData?: Partial<Invoice>
  onSubmit: (data: Partial<Invoice>) => void
  onCancel: () => void
  isLoading?: boolean
}

const SIZE_KEYS = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"]

function ImagePreviewModal({ file, onClose }: { file: any; onClose: () => void }) {
  const [zoom, setZoom] = useState(1)
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-fit h-fit p-0 bg-slate-900 border-slate-800 overflow-hidden rounded-3xl">
        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-950 flex-row justify-between items-center space-y-0 gap-8">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-white font-black uppercase tracking-widest text-xs truncate">
              {file.name}
            </DialogTitle>
            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1 gap-1">
              <button onClick={() => setZoom(p => Math.max(0.5, p - 0.25))} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-black text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(p => Math.min(5, p + 0.25))} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button onClick={() => setZoom(1)} className="text-[8px] font-black uppercase px-2 py-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">Reset</button>
            </div>
          </div>
          <a href={file.data || file.url} download={file.name} className="bg-[#0091D5] hover:bg-[#0081C0] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all shrink-0 flex items-center gap-1 shadow-lg shadow-blue-500/20">
            <Download className="h-3 w-3" /> Download
          </a>
        </DialogHeader>
        <div className="p-8 bg-slate-800 flex items-center justify-center min-h-[300px] overflow-auto max-h-[85vh]">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}>
            <img src={normalizeImageUrl(file.data || file.url)} alt={file.name} className="max-w-[85vw] shadow-2xl rounded-lg" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function InvoiceForm({ initialData, onSubmit, onCancel, isLoading = false }: InvoiceFormProps) {
  const initData = initialData as any
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<any | null>(null)
  const [formData, setFormData] = useState<any>({
    invoice_id: initData?.invoice_id,
    _id: initData?._id,
    client: initData?.client || "",
    client_email: initData?.client_email || "",
    type: initData?.type || "quote",
    status: initData?.status || "draft",
    customer_po: initData?.customer_po || "",
    store_po: initData?.store_po || "",
    design_num: initData?.design_num || "",
    job_title_a: typeof initData?.job_title_a === 'string'
      ? { url: "", desc: initData.job_title_a }
      : (initData?.job_title_a || { url: "", desc: "" }),
    attachments: initData?.attachments || [],
    art_name: initData?.art_name || "",
    print_location: initData?.print_location || "",
    ink_colors: initData?.ink_colors || "",
    garment_info: initData?.garment_info || "",
    finishing_notes: initData?.finishing_notes || "",
    cancel_date: initData?.cancel_date || "",
    sample: initData?.sample || "",
    color: initData?.color || "",
    dates: {
      created: initData?.dates?.created || new Date().toISOString().split('T')[0],
      due: initData?.dates?.due || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    terms: initData?.terms || "Net 7",
    amounts: {
      subtotal: initData?.amounts?.subtotal || 0,
      tax: initData?.amounts?.tax || 0,
      total: initData?.amounts?.total || 0
    },
    billing_address: {
      street: initData?.billing_address?.street || "",
      city: initData?.billing_address?.city || "",
      state: initData?.billing_address?.state || "",
      zip: initData?.billing_address?.zip || ""
    },
    shipping_address: {
      street: initData?.shipping_address?.street || "",
      city: initData?.shipping_address?.city || "",
      state: initData?.shipping_address?.state || "",
      zip: initData?.shipping_address?.zip || ""
    },
    items: initData?.items && initData.items.length > 0 ? initData.items : [{
      category: "Screen Printing",
      item_number: "",
      color: "",
      description: "",
      description_lines: ["", "", "", "", "", "", "", "", "", ""],
      quantity: 0,
      price: 0,
      amount: 0,
      sizes: { "XS": "", "S": "", "M": "", "L": "", "XL": "", "2XL": "", "3XL": "", "4XL": "" }
    }],
    production_notes: initData?.production_notes || "ART LINKS ONLY. FOR ART DEPARTAMENT ONLY. NO ADDITIONAL NOTES.",
    production_lines: initData?.production_lines || ["", "", "", "", "", "", "", "", "", ""],
    art_links: initData?.art_links || [""],
    seps: initData?.seps || "",
    style: initData?.style || "",
    branding: initData?.branding || "",
    priority: initData?.priority || "PRIORITY 2",
    blank_status: initData?.blank_status || "PENDIENTE",
    artwork_status: initData?.artwork_status || "NEW",
    production_attachments: initData?.production_attachments || []
  })
  const [options, setOptions] = useState<any>(null)

  useEffect(() => {
    fetchOptions().then(setOptions).catch(console.error)
  }, [])

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const tax = subtotal * 0.08
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const addItem = () => {
    const newItem: any = {
      item_number: "",
      description: "",
      color: "",
      quantity: 0,
      price: 0,
      amount: 0,
      sizes: { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "2XL": 0, "3XL": 0, "4XL": 0 }
    }
    setFormData((prev: any) => {
      const newItems = [...(prev.items || []), newItem]
      return { ...prev, items: newItems, amounts: calculateTotals(newItems) }
    })
  }

  const removeItem = (index: number) => {
    setFormData((prev: any) => {
      const newItems = [...(prev.items || [])]
      newItems.splice(index, 1)
      return { ...prev, items: newItems, amounts: calculateTotals(newItems) }
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newItems = [...(prev.items || [])]
      const item = { ...newItems[index], [field]: value }

      if (field === "sizes") {
        item.quantity = Object.values(item.sizes as Record<string, number>).reduce((a, b) => a + (Number(b) || 0), 0)
      }

      item.amount = (Number(item.quantity) || 0) * (Number(item.price) || 0)
      newItems[index] = item

      const updates: any = { items: newItems, amounts: calculateTotals(newItems) }
      if (index === 0) {
        if (field === "item_number") updates.garment_info = value
        if (field === "description") updates.print_location = value
      }

      return { ...prev, ...updates }
    })
  }

  const updateSize = (itemIndex: number, size: string, value: string) => {
    const val = parseInt(value) || 0
    setFormData((prev: any) => {
      const newItems = [...(prev.items || [])]
      const item = { ...newItems[itemIndex] }
      const newSizes = { ...(item.sizes || {}), [size]: val }

      const newQty = Object.values(newSizes).reduce((a, b) => (a as number) + (Number(b) || 0), 0) as number

      item.sizes = newSizes
      item.quantity = newQty
      item.amount = newQty * (item.price || 0)

      newItems[itemIndex] = item
      return { ...prev, items: newItems, amounts: calculateTotals(newItems) }
    })
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.5)); // Compresión al 50% para asegurar envío
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string, section: 'production' | number) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        // 1. Preparar el archivo (opcional: podemos comprimirlo antes de subirlo para ahorrar espacio en disco)
        let fileToUpload: File | Blob = file;
        
        if (type === 'image' && file.size > 800 * 1024) {
          const compressedBase64 = await compressImage(file);
          // Convertir Base64 de vuelta a Blob para enviarlo como archivo real
          const res = await fetch(compressedBase64);
          fileToUpload = await res.blob();
        }

        // 2. Subir al servidor inmediatamente
        const formDataUpload = new FormData();
        formDataUpload.append('file', fileToUpload, file.name);

        const uploadRes = await fetch(`/api/mos?endpoint=invoices/upload`, {
          method: 'POST',
          body: formDataUpload
        });

        if (!uploadRes.ok) throw new Error("Error al subir archivo");
        const { url } = await uploadRes.json();

        // 3. Transformar la URL para usar el proxy del Dashboard
        // El backend devuelve /api/invoices/static/... -> necesitamos invoices/static/...
        const cleanPath = url.startsWith('/api/') ? url.replace('/api/', '') : url;
        const proxyUrl = `/api/mos?endpoint=${cleanPath}`;

        // 4. Guardar solo la URL del proxy en el estado
        const attachment = {
          url: proxyUrl, 
          name: file.name,
          type: type,
          mime: file.type,
          data: "", 
        }

        if (section === 'production') {
          setFormData((prev: any) => ({
            ...prev,
            production_attachments: [...(prev.production_attachments || []), attachment]
          }))
        } else {
          setFormData((prev: any) => {
            const newItems = [...(prev.items || [])]
            const item = { ...newItems[section as number] }
            item.attachments = [...(item.attachments || []), attachment]
            newItems[section as number] = item
            return { ...prev, items: newItems }
          })
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error al subir uno de los archivos. Por favor intenta de nuevo.");
    } finally {
      setIsUploading(false)
    }
  }

  const removeAttachment = (index: number, section: 'production' | number) => {
    if (section === 'production') {
      setFormData((prev: any) => {
        const newAtts = [...(prev.production_attachments || [])]
        if (newAtts[index]?.url) URL.revokeObjectURL(newAtts[index].url)
        newAtts.splice(index, 1)
        return { ...prev, production_attachments: newAtts }
      })
    } else {
      setFormData((prev: any) => {
        const newItems = [...(prev.items || [])]
        const item = { ...newItems[section as number] }
        const newAtts = [...(item.attachments || [])]
        if (newAtts[index]?.url) URL.revokeObjectURL(newAtts[index].url)
        newAtts.splice(index, 1)
        item.attachments = newAtts
        newItems[section as number] = item
        return { ...prev, items: newItems }
      })
    }
  }


  const AttachmentUploader = ({ section, attachments }: { section: 'production' | number, attachments: any[] }) => (
    <div className="space-y-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 mt-6 shadow-inner">
      <h4 className="text-[10px] font-black uppercase text-[#0091D5] mb-2 tracking-[0.2em] flex items-center gap-2">
        <Paperclip className="h-3 w-3" /> Media & Document Integration
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 cursor-pointer hover:text-blue-400 transition-colors">
            <ImageIcon className="h-3 w-3 text-blue-400" /> Art File
          </Label>
          <Input
            type="file" multiple accept="image/*"
            onChange={(e) => handleFileChange(e, 'image', section)}
            disabled={isUploading}
            className="bg-slate-950 border-slate-800 text-[10px] text-slate-400 h-10 rounded-xl cursor-pointer file:bg-[#0091D5] file:text-white file:border-0 file:text-[9px] file:font-black file:uppercase file:px-3 file:mr-3 hover:file:bg-[#0081C0] transition-all disabled:opacity-50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 cursor-pointer hover:text-emerald-400 transition-colors">
            <FileSpreadsheet className="h-3 w-3 text-emerald-400" /> Packing List
          </Label>
          <Input
            type="file" accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFileChange(e, 'excel', section)}
            disabled={isUploading}
            className="bg-slate-950 border-slate-800 text-[10px] text-slate-400 h-10 rounded-xl cursor-pointer file:bg-emerald-600 file:text-white file:border-0 file:text-[9px] file:font-black file:uppercase file:px-3 file:mr-3 hover:file:bg-emerald-500 transition-all disabled:opacity-50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 cursor-pointer hover:text-rose-400 transition-colors">
            <FilePdf className="h-3 w-3 text-rose-400" /> Tech Sheet
          </Label>
          <Input
            type="file" accept=".pdf"
            onChange={(e) => handleFileChange(e, 'pdf', section)}
            disabled={isUploading}
            className="bg-slate-950 border-slate-800 text-[10px] text-slate-400 h-10 rounded-xl cursor-pointer file:bg-rose-600 file:text-white file:border-0 file:text-[9px] file:font-black file:uppercase file:px-3 file:mr-3 hover:file:bg-rose-500 transition-all disabled:opacity-50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition-colors">
            <FileUp className="h-3 w-3 text-slate-400" /> Other
          </Label>
          <Input
            type="file" multiple
            onChange={(e) => handleFileChange(e, 'other', section)}
            disabled={isUploading}
            className="bg-slate-950 border-slate-800 text-[10px] text-slate-400 h-10 rounded-xl cursor-pointer file:bg-slate-700 file:text-white file:border-0 file:text-[9px] file:font-black file:uppercase file:px-3 file:mr-3 hover:file:bg-slate-600 transition-all disabled:opacity-50"
          />
        </div>
      </div>

      {attachments && attachments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/50 mt-4">
          {attachments.map((file, i) => (
            <div key={i} className="group relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
              {file.type === 'image' ? (
                <img 
                  src={normalizeImageUrl(file.url || file.data)} 
                  alt={file.name} 
                  className="w-full h-24 object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110 cursor-pointer" 
                  onClick={() => setSelectedImage(file)}
                />
              ) : (
                <div className="w-full h-24 flex flex-col items-center justify-center p-2 text-center bg-slate-900/50">
                  {file.type === 'pdf' ? <FilePdf className="h-8 w-8 text-rose-500 mb-1" /> : file.type === 'excel' ? <FileSpreadsheet className="h-8 w-8 text-emerald-500 mb-1" /> : <FileUp className="h-8 w-8 text-slate-500 mb-1" />}
                  <span className="text-[7px] font-black text-slate-400 w-full uppercase px-1 line-clamp-2">{file.name}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <button
                  onClick={() => removeAttachment(i, section)}
                  className="bg-rose-600 text-white p-1.5 rounded-xl shadow-xl hover:bg-rose-500 active:scale-90 transition-all ml-auto"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8 bg-[#020617] p-10 rounded-[2.5rem] border border-slate-800/50 w-full max-w-full mx-auto shadow-2xl relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0091D5] opacity-[0.03] blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 opacity-[0.02] blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-10">
        <div>
          <h2 className="text-4xl font-black text-[#0091D5] uppercase italic tracking-tighter flex items-center gap-3">
            <span className="w-2 h-10 bg-[#0091D5] rounded-full" />
            {initialData ? "Evolution Order Edit" : "Prosper Production Master"}
          </h2>
          <p className="text-slate-500 text-xs font-black mt-2 uppercase tracking-[0.3em] ml-5">Cross-Border Logistics & Manufacturing Intelligence</p>
        </div>
        <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-white bg-slate-900/50 rounded-full h-12 w-12 p-0">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Section: Production & Notes */}
        <div className="lg:col-span-1 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#0091D5] mb-2">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Production Intelligence</h3>
            </div>

            <div className="space-y-6 bg-slate-900/20 p-8 rounded-[2rem] border border-slate-800/50 backdrop-blur-xl">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Production Notes</Label>
                <Textarea
                  value={formData.production_notes || ""}
                  onChange={e => setFormData({ ...formData, production_notes: e.target.value })}
                  className="bg-slate-950/50 border-slate-800 text-white text-xs h-32 rounded-2xl resize-none focus:ring-1 focus:ring-[#0091D5]/30 transition-all"
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Art Links (CAD/High-Res)</Label>
                <Textarea
                  value={typeof formData.art_links === 'string' ? formData.art_links : (formData.art_links || []).join('\n')}
                  onChange={e => setFormData({ ...formData, art_links: e.target.value })}
                  placeholder="Paste links and descriptions here..."
                  className="bg-slate-950/50 border-slate-800 text-white text-xs h-32 rounded-2xl resize-none focus:ring-1 focus:ring-[#0091D5]/30 transition-all"
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Separations (SEPS)</Label>
                <Input
                  value={formData.seps || ""}
                  onChange={e => setFormData({ ...formData, seps: e.target.value })}
                  placeholder="e.g. Front/Back Seps"
                  className="bg-slate-950/50 border-slate-800 text-white h-11 text-xs rounded-xl focus:ring-1 focus:ring-[#0091D5]/30 transition-all"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-amber-500 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Workflow className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Operational parameters</h3>
            </div>

            <div className="space-y-6 bg-slate-900/20 p-8 rounded-[2rem] border border-slate-800/50 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Job Title A (Desc)</Label>
                  <Input
                    value={(formData.job_title_a as any)?.desc || ""}
                    onChange={e => setFormData({ ...formData, job_title_a: { ...(formData.job_title_a as any), desc: e.target.value } })}
                    className="bg-slate-950/50 border-slate-800 text-white h-11 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Job Title A (URL)</Label>
                  <Input
                    value={normalizePublicUrl((formData.job_title_a as any)?.url) || ""}
                    onChange={e => setFormData({ ...formData, job_title_a: { ...(formData.job_title_a as any), url: e.target.value } })}
                    className="bg-slate-950/50 border-slate-800 text-blue-400 h-11 text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Sample Status</Label>
                  <Select value={formData.sample || ""} onValueChange={v => setFormData({ ...formData, sample: v })}>
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl text-[10px] font-bold">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
                      {options?.samples?.map((s: string) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Art Status</Label>
                  <Select value={formData.artwork_status || ""} onValueChange={v => setFormData({ ...formData, artwork_status: v })}>
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl text-[10px] font-bold">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
                      {options?.artwork_statuses?.map((a: string) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Branding</Label>
                  <Select value={formData.branding || ""} onValueChange={v => setFormData({ ...formData, branding: v })}>
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl text-[10px] font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
                      {options?.brandings?.map((b: string) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Priority</Label>
                  <Select value={formData.priority || ""} onValueChange={v => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-11 rounded-xl text-[10px] font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
                      {options?.priorities?.map((p: string) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Section: Core Info & Line Items */}
        <div className="lg:col-span-2 space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/20 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 block">Client / Portfolio</Label>
                <Select value={formData.client || ""} onValueChange={v => setFormData({ ...formData, client: v })}>
                  <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-14 rounded-2xl font-black uppercase text-xs shadow-lg focus:ring-[#0091D5]/40 transition-all">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-[2rem] max-h-[400px]">
                    {options?.clients?.map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 block">Color</Label>
                <Input
                  value={formData.color || ""}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g. VINTAGE BLACK"
                  className="bg-slate-950/50 border-slate-800 text-white h-14 rounded-2xl font-black uppercase text-xs shadow-sm focus:ring-[#0091D5]/40 transition-all"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Order ID</Label>
                   <div className="bg-slate-900/80 border border-slate-800 text-[#0091D5] h-14 rounded-2xl px-4 flex items-center font-mono font-black text-xl shadow-inner">
                     {formData.invoice_id || "NEW"}
                   </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Type</Label>
                  <Select
                    value={formData.type || "quote"}
                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white h-14 rounded-2xl uppercase font-black text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">PO #</Label>
                  <Input
                    value={formData.customer_po || ""}
                    onChange={e => setFormData({ ...formData, customer_po: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 text-white h-14 rounded-2xl font-mono text-center font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Store PO #</Label>
                  <Input
                    value={formData.store_po || ""}
                    onChange={e => setFormData({ ...formData, store_po: e.target.value })}
                    placeholder="E.G. 12345"
                    className="bg-slate-950/50 border-slate-800 text-white h-14 rounded-2xl font-mono text-center font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Created</Label>
                <Input
                  type="date"
                  value={formData.dates?.created || ""}
                  onChange={e => setFormData({ ...formData, dates: { ...formData.dates!, created: e.target.value } })}
                  className="bg-slate-950/50 border-slate-800 text-white h-14 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0091D5]">Production Due</Label>
                <Input
                  type="date"
                  value={formData.dates?.due || ""}
                  onChange={e => setFormData({ ...formData, dates: { ...formData.dates!, due: e.target.value } })}
                  className="bg-slate-950/50 border-[#0091D5]/30 text-[#0091D5] h-14 rounded-2xl font-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-rose-500">Cancel Date</Label>
                <Input
                  type="date"
                  value={formData.cancel_date || ""}
                  onChange={e => setFormData({ ...formData, cancel_date: e.target.value })}
                  className="bg-slate-950/50 border-rose-500/30 text-rose-500 h-14 rounded-2xl font-black"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Terms</Label>
                <Input
                  value={formData.terms || ""}
                  onChange={e => setFormData({ ...formData, terms: e.target.value })}
                  className="bg-slate-950/50 border-slate-800 text-white h-14 rounded-2xl uppercase font-black text-center"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div className="flex items-center gap-3 text-emerald-500">
                   <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <Plus className="h-5 w-5" />
                   </div>
                   <h3 className="text-xs font-black uppercase tracking-[0.2em]">Itemized Production Breakdown</h3>
                </div>
                <Button 
                  onClick={addItem}
                  className="bg-[#0091D5] hover:bg-[#0081C0] text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Append New Line Item
                </Button>
             </div>

             <div className="space-y-8">
                {formData.items?.map((item: any, idx: number) => (
                  <div key={idx} className="relative bg-slate-900/10 border border-slate-800/80 rounded-[2.5rem] p-10 group hover:border-[#0091D5]/40 transition-all duration-500 shadow-xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#0091D5] opacity-20" />
                    
                    <button
                      onClick={() => removeItem(idx)}
                      className="absolute top-6 right-6 text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 h-10 w-10 flex items-center justify-center bg-slate-900/50 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                      <div className="md:col-span-4 space-y-6">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Style / SKU</Label>
                           <Input
                             value={(item as any).item_number || ""}
                             onChange={e => updateItem(idx, "item_number", e.target.value)}
                             className="bg-slate-950/50 border-slate-800 h-14 rounded-2xl font-black text-white uppercase text-base"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Colorway</Label>
                           <Input
                             value={(item as any).color || ""}
                             onChange={e => updateItem(idx, "color", e.target.value)}
                             className="bg-slate-950/50 border-slate-800 h-14 rounded-2xl font-black text-white uppercase"
                           />
                        </div>
                      </div>

                      <div className="md:col-span-8 space-y-6">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Production Specifications</Label>
                           <Textarea
                             value={item.description || ""}
                             onChange={e => updateItem(idx, "description", e.target.value)}
                             className="bg-slate-950/50 border-slate-800 h-32 rounded-2xl text-slate-300 resize-none focus:ring-[#0091D5]/30"
                             placeholder="E.g., Screen print front, neck label, custom bag..."
                           />
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col xl:flex-row items-end justify-between gap-10">
                       <div className="flex-1 w-full space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Global Matrix (XS-4XL)</Label>
                          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                             {SIZE_KEYS.map(size => (
                               <div key={size} className="flex flex-col items-center gap-3 bg-slate-950/60 border border-slate-800/50 rounded-2xl py-4 group/size hover:bg-[#0091D5]/5 transition-all">
                                  <span className="text-[9px] font-black text-slate-600 group-hover/size:text-[#0091D5] uppercase">{size}</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={item.sizes?.[size] || ""}
                                    onChange={e => updateSize(idx, size, e.target.value.replace(/[^0-9]/g, ""))}
                                    className="w-full bg-transparent border-none text-center text-xl font-black text-white focus:ring-0 p-0"
                                  />
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="flex items-center gap-10 bg-slate-950/80 p-6 rounded-[2rem] border border-[#0091D5]/20 shadow-2xl">
                          <div className="text-center">
                             <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Total Qty</p>
                             <p className="text-4xl font-black text-white tracking-tighter">{item.quantity || 0}</p>
                          </div>
                          <div className="w-px h-16 bg-slate-800" />
                          <div className="text-center">
                             <p className="text-[9px] font-black uppercase text-emerald-500 mb-1">Unit Val</p>
                             <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-emerald-500/50">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.price || 0}
                                  onChange={e => updateItem(idx, "price", parseFloat(e.target.value))}
                                  className="w-24 bg-transparent border-none text-2xl font-black text-emerald-400 focus:ring-0 p-0 text-center"
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    <AttachmentUploader section={idx} attachments={item.attachments || []} />
                  </div>
                ))}
             </div>
          </section>

          <section className="bg-slate-900/20 p-10 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
             <div className="flex items-center gap-3 text-amber-500 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                   <Scissors className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Finishing & Fulfillment instructions</h3>
             </div>
             <Textarea
               value={formData.finishing_notes || ""}
               onChange={e => setFormData({ ...formData, finishing_notes: e.target.value })}
               placeholder="Enter all packing, folding, and finishing instructions here..."
               className="bg-slate-950/50 border-slate-800 text-white text-sm min-h-[250px] rounded-[2rem] resize-none focus:ring-amber-500/30 p-8"
             />
             <AttachmentUploader section="production" attachments={formData.production_attachments || []} />
          </section>

          <div className="flex flex-col items-end space-y-4 pt-10 border-t border-slate-800">
             <div className="flex justify-between w-full max-w-md text-[11px] font-black text-slate-500 uppercase tracking-widest">
                <span>Gross Value</span>
                <span className="text-white font-mono text-base">${(formData.amounts?.subtotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
             </div>
             <div className="flex justify-between w-full max-w-md text-[11px] font-black text-slate-500 uppercase tracking-widest">
                <span>Consolidated Tax (8%)</span>
                <span className="text-white font-mono text-base">${(formData.amounts?.tax || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
             </div>
             <div className="flex justify-between w-full max-w-md pt-6 mt-4 border-t border-slate-800/50">
                <span className="text-2xl font-black text-[#0091D5] uppercase italic tracking-tighter">Grand Final Total</span>
                <span className="text-5xl font-black text-white font-mono tracking-tighter leading-none">${(formData.amounts?.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-6 pt-16 border-t border-slate-800">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 font-black uppercase tracking-[0.2em] text-[10px] h-16 px-10 rounded-2xl transition-all"
        >
          Discard Evolution
        </Button>
        <Button
          onClick={() => onSubmit(formData)}
          disabled={isLoading || isUploading}
          className="bg-[#0091D5] hover:bg-[#0081C0] text-white font-black uppercase tracking-[0.2em] text-[10px] h-16 px-16 rounded-2xl shadow-[0_0_50px_rgba(0,145,213,0.3)] disabled:opacity-50 transition-all flex items-center gap-3"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Save className="h-6 w-6" strokeWidth={3} />
          )}
          {isUploading ? "Uploading Media..." : isLoading ? "Synchronizing..." : "Commit Document"}
        </Button>
      </div>

      {selectedImage && (
        <ImagePreviewModal 
          file={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  )
}
