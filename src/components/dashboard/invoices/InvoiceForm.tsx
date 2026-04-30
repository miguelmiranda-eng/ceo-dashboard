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
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Invoice, InvoiceItem, fetchOptions } from "@/lib/api"
import { cn } from "@/lib/utils"

interface InvoiceFormProps {
  initialData?: Partial<Invoice>
  onSubmit: (data: Partial<Invoice>) => void
  onCancel: () => void
  isLoading?: boolean
}

const SIZE_KEYS = ["XS", "S", "M", "L", "XL", "2X", "3X", "4X", "5X"]

export function InvoiceForm({ initialData, onSubmit, onCancel, isLoading = false }: InvoiceFormProps) {
  // Aseguramos que TODO tenga un valor inicial definido para evitar el error de React
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoice_id: initialData?.invoice_id,
    _id: initialData?._id,
    client: initialData?.client || "",
    client_email: initialData?.client_email || "",
    type: initialData?.type || "quote",
    status: initialData?.status || "draft",
    customer_po: initialData?.customer_po || "",
    store_po: initialData?.store_po || "",
    design_num: initialData?.design_num || "",
    job_title_a: typeof initialData?.job_title_a === 'string' 
      ? { url: "", desc: initialData.job_title_a } 
      : (initialData?.job_title_a || { url: "", desc: "" }),
    attachments: initialData?.attachments || [],
    art_name: initialData?.art_name || "",
    print_location: initialData?.print_location || "",
    ink_colors: initialData?.ink_colors || "",
    garment_info: initialData?.garment_info || "",
    finishing_notes: initialData?.finishing_notes || "",
    cancel_date: initialData?.cancel_date || "",
    sample: initialData?.sample || "",
    color: initialData?.color || "",
    dates: {
      created: initialData?.dates?.created || new Date().toISOString().split('T')[0],
      due: initialData?.dates?.due || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    terms: initialData?.terms || "Net 7",
    amounts: { 
      subtotal: initialData?.amounts?.subtotal || 0, 
      tax: initialData?.amounts?.tax || 0, 
      total: initialData?.amounts?.total || 0 
    },
    billing_address: { 
      street: initialData?.billing_address?.street || "", 
      city: initialData?.billing_address?.city || "", 
      state: initialData?.billing_address?.state || "", 
      zip: initialData?.billing_address?.zip || "" 
    },
    shipping_address: { 
      street: initialData?.shipping_address?.street || "", 
      city: initialData?.shipping_address?.city || "", 
      state: initialData?.shipping_address?.state || "", 
      zip: initialData?.shipping_address?.zip || "" 
    },
    items: initialData?.items && initialData.items.length > 0 ? initialData.items : [{
      category: "Screen Printing",
      item_number: "",
      color: "",
      description: "",
      quantity: 0,
      price: 0,
      amount: 0,
      sizes: { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "2X": 0, "3X": 0, "4X": 0, "5X": 0 }
    }],
    production_notes: initialData?.production_notes || "ART LINKS ONLY. FOR ART DEPARTAMENT ONLY. NO ADDITIONAL NOTES.",
    art_links: initialData?.art_links || [""],
    seps: initialData?.seps || "",
    style: initialData?.style || "",
    branding: initialData?.branding || "",
    priority: initialData?.priority || "PRIORITY 2",
    blank_status: initialData?.blank_status || "PENDIENTE",
    artwork_status: initialData?.artwork_status || "NEW",
    sample: initialData?.sample || "",
    color: initialData?.color || "",
  })
  const [options, setOptions] = useState<any>(null)

  useEffect(() => {
    fetchOptions().then(setOptions).catch(console.error)
  }, [])

  const addItem = () => {
    const newItem: InvoiceItem = {
      category: "Screen Printing",
      item_number: "",
      color: "BLACK",
      description: "",
      quantity: 0,
      price: 0,
      amount: 0,
      sizes: { "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "2X": 0, "3X": 0, "4X": 0, "5X": 0 }
    }
    setFormData({
      ...formData,
      items: [...(formData.items || []), newItem]
    })
  }

  const removeItem = (index: number) => {
    const newItems = [...(formData.items || [])]
    newItems.splice(index, 1)
    setFormData({ ...formData, items: newItems })
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(formData.items || [])]
    const item = { ...newItems[index], [field]: value }
    
    if (field === "sizes") {
      item.quantity = Object.values(item.sizes as Record<string, number>).reduce((a, b) => a + (Number(b) || 0), 0)
    }
    
    item.amount = (Number(item.quantity) || 0) * (Number(item.price) || 0)
    
    newItems[index] = item
    
    const updates: any = { items: newItems }
    if (index === 0) {
      if (field === "item_number") updates.garment_info = value
      if (field === "description") updates.print_location = value
    }
    
    setFormData({ ...formData, ...updates })
  }

  const updateSize = (itemIndex: number, size: string, value: string) => {
    const val = parseInt(value) || 0
    const newItems = [...(formData.items || [])]
    const item = { ...newItems[itemIndex] }
    const newSizes = { ...(item.sizes || {}), [size]: val }
    
    // 1. Calcular nueva cantidad total
    const newQty = Object.values(newSizes).reduce((a, b) => (a as number) + (Number(b) || 0), 0) as number
    
    // 2. Generar desglose para la descripción
    const breakdown = Object.entries(newSizes)
      .filter(([_, q]) => (q as number) > 0)
      .map(([sz, q]) => `${sz}-${q}`)
      .join("\n")
    const baseDesc = item.description.split("\n\n---\nSIZES:")[0]
    
    // 3. Aplicar todos los cambios al item
    item.sizes = newSizes
    item.quantity = newQty
    item.description = breakdown ? `${baseDesc}\n\n---\nSIZES:\n${breakdown}` : baseDesc
    item.amount = newQty * (item.price || 0)
    
    newItems[itemIndex] = item
    setFormData({ ...formData, items: newItems })
  }

  const addArtLink = () => {
    setFormData({ ...formData, art_links: [...(formData.art_links || []), ""] })
  }

  const [previews, setPreviews] = useState<{url: string, name: string, type: string}[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files
    if (!files) return
    
    const newPreviews = [...previews]
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file)
      newPreviews.push({ url, name: file.name, type })
      
      // También lo agregamos al formData para que se envíe al backend (como base64 o referencia)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), {
            name: file.name,
            type: file.type,
            data: reader.result as string,
            category: type
          }]
        }))
      }
      reader.readAsDataURL(file)
    })
    setPreviews(newPreviews)
  }

  const removePreview = (index: number) => {
    const newPreviews = [...previews]
    URL.revokeObjectURL(newPreviews[index].url)
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  useEffect(() => {
    const subtotal = (formData.items || []).reduce((sum, item) => sum + item.amount, 0)
    const tax = subtotal * 0.08 
    const total = subtotal + tax
    
    setFormData(prev => ({
      ...prev,
      amounts: { subtotal, tax, total }
    }))
  }, [formData.items])

  return (
    <div className="space-y-8 bg-[#0B1120] p-8 rounded-3xl border border-slate-800 w-full max-w-full mx-auto shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-blue-500 uppercase italic tracking-tighter">
            {initialData ? "Edit Production Order" : "Prosper Production Master"}
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Invoicing & Production Worksheet</p>
        </div>
        <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-white bg-slate-900/50">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section: Production & Notes */}
        <div className="lg:col-span-1 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <ClipboardList className="h-4 w-4" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Production Intelligence</h3>
            </div>
            
            <div className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Production Notes</Label>
                <Textarea 
                  value={formData.production_notes || ""}
                  onChange={e => setFormData({...formData, production_notes: e.target.value})}
                  className="bg-slate-950 border-slate-800 text-white text-xs h-24 resize-none"
                />
              </div>
              
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Art Links (CAD/High-Res)</Label>
                <div className="space-y-2">
                  {formData.art_links?.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <Input 
                        value={link || ""}
                        onChange={e => {
                          const newLinks = [...(formData.art_links || [])]
                          newLinks[i] = e.target.value
                          setFormData({...formData, art_links: newLinks})
                        }}
                        placeholder="https://docs.google.com/..."
                        className="bg-slate-950 border-slate-800 text-white h-9 text-xs"
                      />
                    </div>
                  ))}
                  <Button onClick={addArtLink} variant="ghost" className="h-7 text-[9px] text-blue-400 hover:bg-blue-400/10 font-bold uppercase w-full border border-dashed border-blue-500/20">
                    <Plus className="h-3 w-3 mr-1" /> Add Art Link
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Separations (SEPS)</Label>
                <Input 
                  value={formData.seps || ""}
                  onChange={e => setFormData({...formData, seps: e.target.value})}
                  placeholder="e.g. Front/Back Seps"
                  className="bg-slate-950 border-slate-800 text-white h-9 text-xs"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Paperclip className="h-4 w-4" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Documentación y Adjuntos</h3>
            </div>
            
            <div className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3 text-blue-400" /> Cargar Arte / Imagen
                  </Label>
                  <Input 
                    type="file" 
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="bg-slate-950 border-slate-800 text-[10px] text-slate-400 h-9 cursor-pointer file:bg-blue-600 file:text-white file:border-0 file:text-[9px] file:font-black file:uppercase file:px-3 file:mr-3 hover:file:bg-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3 w-3 text-emerald-400" /> Packing List (Excel)
                  </Label>
                  <Input 
                    type="file" 
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileChange(e, 'excel')}
                    className="bg-slate-950 border-slate-800 text-[10px] text-slate-400 h-9 cursor-pointer file:bg-emerald-600 file:text-white file:border-0 file:text-[9px] file:font-black file:uppercase file:px-3 file:mr-3 hover:file:bg-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <FilePdf className="h-3 w-3 text-rose-400" /> Ficha Técnica (PDF)
                  </Label>
                  <Input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'pdf')}
                    className="bg-slate-950 border-slate-800 text-[10px] text-slate-400 h-9 cursor-pointer file:bg-rose-600 file:text-white file:border-0 file:text-[9px] file:font-black file:uppercase file:px-3 file:mr-3 hover:file:bg-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <FileUp className="h-3 w-3 text-slate-400" /> Otros Documentos
                  </Label>
                  <Input 
                    type="file" 
                    multiple
                    onChange={(e) => handleFileChange(e, 'other')}
                    className="bg-slate-950 border-slate-800 text-[10px] text-slate-400 h-9 cursor-pointer file:bg-slate-700 file:text-white file:border-0 file:text-[9px] file:font-black file:uppercase file:px-3 file:mr-3 hover:file:bg-slate-600"
                  />
                </div>
              </div>

              {/* Grid de Previsualización Visual */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50 mt-4">
                  {previews.map((file, i) => (
                    <div key={i} className="group relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg animate-in zoom-in-95 duration-200">
                      {file.type === 'image' ? (
                        <img src={file.url} alt={file.name} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-40 flex flex-col items-center justify-center p-4 text-center bg-slate-900/50">
                          {file.type === 'pdf' ? <FilePdf className="h-10 w-10 text-rose-500 mb-2" /> : <FileSpreadsheet className="h-10 w-10 text-emerald-500 mb-2" />}
                          <span className="text-[8px] font-black text-slate-400 truncate w-full uppercase px-2">{file.name}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                         <span className="text-[7px] font-black text-white uppercase truncate flex-1 mr-2">{file.name}</span>
                         <button 
                           onClick={() => removePreview(i)}
                           className="bg-rose-600 text-white p-1.5 rounded-lg shadow-xl hover:bg-rose-500 active:scale-95 transition-all"
                         >
                           <X className="h-3 w-3" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Workflow className="h-4 w-4" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Production Parameters (MOS)</h3>
            </div>
            
            <div className="space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Job Title A (Description)</Label>
                  <Input 
                    value={(formData.job_title_a as any)?.desc || ""}
                    onChange={e => setFormData({...formData, job_title_a: {...(formData.job_title_a as any), desc: e.target.value}})}
                    placeholder="Descripción..."
                    className="bg-slate-950 border-slate-800 text-white h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Job Title A (Link)</Label>
                  <Input 
                    value={(formData.job_title_a as any)?.url || ""}
                    onChange={e => setFormData({...formData, job_title_a: {...(formData.job_title_a as any), url: e.target.value}})}
                    placeholder="https://..."
                    className="bg-slate-950 border-slate-800 text-blue-400 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Sample Status</Label>
                  <Select value={formData.sample || ""} onValueChange={v => setFormData({...formData, sample: v})}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-9 text-[10px] font-bold">
                      <SelectValue placeholder="Seleccionar Sample..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {options?.samples?.map((s: string) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Art Status</Label>
                  <Select value={formData.artwork_status || ""} onValueChange={v => setFormData({...formData, artwork_status: v})}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-9 text-[10px] font-bold">
                      <SelectValue placeholder="Seleccionar Artwork Status..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-[250px]">
                      {options?.artwork_statuses?.map((a: string) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Estilo</Label>
                  <Input 
                    value={formData.garment_info || ""}
                    onChange={e => {
                      const val = e.target.value;
                      const newItems = [...(formData.items || [])];
                      if (newItems.length > 0) {
                        newItems[0] = { ...newItems[0], item_number: val };
                      }
                      setFormData({...formData, garment_info: val, items: newItems});
                    }}
                    placeholder="e.g. ALSTYLE 1301 - BLACK"
                    className="bg-slate-950 border-slate-800 text-white h-9 text-xs font-bold"
                  />
                </div>
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Descripción</Label>
                  <Input 
                    value={formData.print_location || ""}
                    onChange={e => {
                      const val = e.target.value;
                      const newItems = [...(formData.items || [])];
                      if (newItems.length > 0) {
                        newItems[0] = { ...newItems[0], description: val };
                      }
                      setFormData({...formData, print_location: val, items: newItems});
                    }}
                    placeholder="e.g. Pierce the Veil Tee - Front Print"
                    className="bg-slate-950 border-slate-800 text-white h-9 text-xs"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Branding / Técnica</Label>
                  <Select value={formData.branding || ""} onValueChange={v => setFormData({...formData, branding: v})}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-9 text-[10px] font-bold">
                      <SelectValue placeholder="Técnica" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-[250px]">
                      {options?.brandings?.map((b: string) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Priority</Label>
                  <Select value={formData.priority || ""} onValueChange={v => setFormData({...formData, priority: v})}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-9 text-[10px] font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {options?.priorities?.map((p: string) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Blank Status</Label>
                  <Select value={formData.blank_status || ""} onValueChange={v => setFormData({...formData, blank_status: v})}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-9 text-[10px] font-bold">
                      <SelectValue placeholder="Estado Blank" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-[250px]">
                      {options?.blank_statuses?.map((s: string) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <MapPin className="h-4 w-4" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Addresses</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Customer Billing</Label>
                <Textarea 
                  value={formData.billing_address?.street || ""}
                  onChange={e => setFormData({...formData, billing_address: {...formData.billing_address!, street: e.target.value}})}
                  placeholder="Address Line 1\nCity, State Zip"
                  className="bg-slate-950 border-slate-800 text-white text-xs h-20 resize-none"
                />
              </div>
              <div>
                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Customer Shipping</Label>
                <Textarea 
                  value={formData.shipping_address?.street || ""}
                  onChange={e => setFormData({...formData, shipping_address: {...formData.shipping_address!, street: e.target.value}})}
                  placeholder="Address Line 1\nCity, State Zip"
                  className="bg-slate-950 border-slate-800 text-white text-xs h-20 resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Section: Core Info & Line Items */}
        <div className="lg:col-span-2 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Client / Strategic Portfolio</Label>
                <Select value={formData.client || ""} onValueChange={v => setFormData({...formData, client: v})}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-11 font-bold uppercase text-xs">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-[300px]">
                    {options?.clients?.map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {formData.invoice_id ? (
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Order #</Label>
                    <div className="bg-slate-900/50 border border-slate-800 text-blue-400 h-11 rounded-md px-3 flex items-center font-mono font-black text-lg">
                      {formData.invoice_id}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Order #</Label>
                    <div className="bg-slate-950 border border-slate-800 text-slate-500 h-11 rounded-md px-3 flex items-center font-mono font-bold text-xs italic">
                      Auto-generated
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Type</Label>
                  <Select 
                    value={formData.type || "quote"}
                    onValueChange={(value) => setFormData({...formData, type: value as any})}
                  >
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-11 uppercase font-bold text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      <SelectItem value="quote">Quote</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Customer PO #</Label>
                  <Input 
                    value={formData.customer_po || ""} 
                    onChange={e => setFormData({...formData, customer_po: e.target.value})}
                    placeholder="20636"
                    className="bg-slate-950 border-slate-800 text-white h-11 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">STORE PO#</Label>
                  <Input 
                    value={formData.store_po || ""} 
                    onChange={e => setFormData({...formData, store_po: e.target.value})}
                    placeholder="104523"
                    className="bg-slate-950 border-slate-800 text-white h-11 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Design #</Label>
                  <Input 
                    value={formData.design_num || ""} 
                    onChange={e => setFormData({...formData, design_num: e.target.value})}
                    placeholder="D-542"
                    className="bg-slate-950 border-slate-800 text-blue-400 h-11 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Created Date</Label>
                  <Input 
                    type="date"
                    value={formData.dates?.created || ""} 
                    onChange={e => setFormData({...formData, dates: {...formData.dates!, created: e.target.value}})}
                    className="bg-slate-950 border-slate-800 text-white h-11"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Production Due</Label>
                  <Input 
                    type="date"
                    value={formData.dates?.due || ""} 
                    onChange={e => setFormData({...formData, dates: {...formData.dates!, due: e.target.value}})}
                    className="bg-slate-950 border-slate-800 text-white h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Cancel Date</Label>
                  <Input 
                    type="date"
                    value={formData.cancel_date || ""} 
                    onChange={e => setFormData({...formData, cancel_date: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-rose-400 h-11 font-bold"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Payment Terms</Label>
                  <Input 
                    value={formData.terms || ""} 
                    onChange={e => setFormData({...formData, terms: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white h-11 uppercase font-bold"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Color (Global)</Label>
                <Input 
                  value={formData.color || ""} 
                  onChange={e => setFormData({...formData, color: e.target.value})}
                  placeholder="e.g. BLACK / WHITE"
                  className="bg-slate-950 border-slate-800 text-white h-11 uppercase"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Scissors className="h-4 w-4" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Order Specification (Line Items)</h3>
              </div>
              <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-4 text-[10px] font-black uppercase tracking-widest">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            <div className="space-y-6">
              {formData.items?.map((item, idx) => (
                <div key={idx} className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 space-y-6 relative group">
                  <Button 
                    onClick={() => removeItem(idx)} 
                    variant="ghost" 
                    className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <Label className="text-[9px] font-black text-slate-600 uppercase mb-2 block">Category</Label>
                      <Input 
                        value={item.category || ""}
                        onChange={e => updateItem(idx, "category", e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white h-9 text-xs font-bold"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-[9px] font-black text-slate-600 uppercase mb-2 block">Description / Garment Info</Label>
                      <Input 
                        value={item.description || ""}
                        onChange={e => updateItem(idx, "description", e.target.value)}
                        placeholder="e.g. TUPAC TEE - ALL EYEZ TRACK LIST"
                        className="bg-slate-950 border-slate-800 text-white h-9 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[9px] font-black text-slate-600 uppercase mb-2 block">Price</Label>
                      <Input 
                        type="number"
                        value={item.price || 0}
                        onChange={e => updateItem(idx, "price", parseFloat(e.target.value))}
                        className="bg-slate-950 border-slate-800 text-emerald-400 h-9 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-10 gap-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800/30">
                    {SIZE_KEYS.map(size => (
                      <div key={size}>
                        <Label className="text-[9px] font-black text-slate-600 uppercase mb-2 block text-center">{size}</Label>
                        <Input 
                          type="number"
                          value={item.sizes?.[size] || 0}
                          onChange={e => updateSize(idx, size, e.target.value)}
                          className="bg-slate-900 border-slate-800 text-white h-9 text-center text-xs font-mono px-1"
                        />
                      </div>
                    ))}
                    <div className="col-span-1">
                      <Label className="text-[9px] font-black text-blue-500 uppercase mb-2 block text-center">Total</Label>
                      <div className="h-9 flex items-center justify-center font-black text-white text-xs font-mono bg-blue-500/10 rounded-md border border-blue-500/20">
                        {item.quantity || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col items-end space-y-3 pt-8 border-t border-slate-800">
             <div className="flex justify-between w-full max-w-sm text-xs font-bold text-slate-500 uppercase">
                <span>Subtotal</span>
                <span className="text-white font-mono">${(formData.amounts?.subtotal || 0).toLocaleString()}</span>
             </div>
             <div className="flex justify-between w-full max-w-sm text-xs font-bold text-slate-500 uppercase">
                <span>Tax (8%)</span>
                <span className="text-white font-mono">${(formData.amounts?.tax || 0).toLocaleString()}</span>
             </div>
             <div className="flex justify-between w-full max-w-sm pt-4 mt-2 border-t border-slate-800">
                <span className="text-xl font-black text-blue-400 uppercase italic">Grand Total</span>
                <span className="text-3xl font-black text-white font-mono">${(formData.amounts?.total || 0).toLocaleString()}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-12 border-t border-slate-800">
        <Button variant="outline" onClick={onCancel} className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 font-black uppercase tracking-widest text-xs h-12 px-8">
          Discard Changes
        </Button>
        <Button 
          onClick={() => onSubmit(formData)} 
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs h-12 px-12 shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-3 h-5 w-5" strokeWidth={3} />
          )}
          {isLoading ? "Committing..." : "Commit Order"}
        </Button>
      </div>
    </div>
  )
}
