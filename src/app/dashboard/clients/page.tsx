"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Plus, Search, Users, Mail, Phone, Building2, MapPin,
  Pencil, Trash2, Save, X, Loader2, FileText,
} from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n"
import {
  fetchClientRegistry,
  saveClientRegistry,
  newClientId,
  type ClientRecord,
} from "@/lib/client-registry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const INPUT_CLS =
  "w-full h-11 px-3 rounded-xl border-2 border-slate-200 bg-white text-[13px] font-bold text-slate-700 focus:outline-none focus:border-blue-400"

const emptyClient = (): ClientRecord => ({
  id: "", name: "", company: "", contact: "", email: "", phone: "",
  terms: "Net 30", tax_id: "", billing_address: "", shipping_address: "", notes: "",
})

export default function ClientsPage() {
  const { language } = useI18n()
  const es = language === "es"
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<ClientRecord | null>(null)
  const [saving, setSaving] = useState(false)

  const { data: clients, mutate, isLoading } = useSWR<ClientRecord[]>(
    "client-registry",
    fetchClientRegistry,
    { revalidateOnFocus: false },
  )

  const list = (clients || []).filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return [c.name, c.company, c.email, c.contact].some((v) => (v || "").toLowerCase().includes(q))
  })

  const handleSave = async () => {
    if (!editing) return
    if (!editing.name.trim()) {
      toast.error(es ? "El nombre del cliente es obligatorio." : "Client name is required.")
      return
    }
    setSaving(true)
    try {
      const current = clients || []
      const isNew = !editing.id
      const record: ClientRecord = {
        ...editing,
        id: editing.id || newClientId(),
        name: editing.name.trim(),
        created_at: editing.created_at || new Date().toISOString(),
      }
      const next = isNew
        ? [...current, record]
        : current.map((c) => (c.id === record.id ? record : c))
      await saveClientRegistry(next)
      await mutate(next, { revalidate: false })
      toast.success(es ? "Cliente guardado." : "Client saved.")
      setEditing(null)
    } catch (err: any) {
      toast.error(err?.message || (es ? "Error al guardar." : "Save failed."))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(es ? "¿Eliminar este cliente del registro?" : "Delete this client from the registry?")) return
    try {
      const next = (clients || []).filter((c) => c.id !== id)
      await saveClientRegistry(next)
      await mutate(next, { revalidate: false })
      toast.success(es ? "Cliente eliminado." : "Client deleted.")
    } catch (err: any) {
      toast.error(err?.message || (es ? "Error al eliminar." : "Delete failed."))
    }
  }

  const setField = (field: keyof ClientRecord, value: string) =>
    setEditing((p) => (p ? { ...p, [field]: value } : p))

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-1">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-12 bg-[#0091D5] rounded-full shadow-[0_0_20px_rgba(0,145,213,0.4)]" />
            <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase italic leading-none">
              {es ? "Clientes" : "Clients"}
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 opacity-70">
            {es ? "Registro Completo de Clientes" : "Complete Client Registry"}
          </p>
        </div>
        <Button
          onClick={() => setEditing(emptyClient())}
          className="bg-[#0091D5] hover:bg-[#0081C0] text-white font-black uppercase text-xs tracking-widest px-8 h-14 rounded-2xl shadow-lg shadow-blue-500/20"
        >
          <Plus className="mr-2 h-5 w-5" strokeWidth={3} /> {es ? "Nuevo Cliente" : "New Client"}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={es ? "Buscar por nombre, compañía, email..." : "Search by name, company, email..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 bg-white border-2 border-slate-200 text-slate-900 h-12 rounded-xl"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-3" /> {es ? "Cargando..." : "Loading..."}
        </div>
      ) : list.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Users className="h-12 w-12 opacity-40" />
            <p className="text-sm font-bold uppercase tracking-widest">
              {es ? "Sin clientes registrados" : "No registered clients"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((c) => (
            <Card key={c.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0091D5] font-black text-lg shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[#0F172A] uppercase text-sm truncate">{c.name}</p>
                      {c.company && <p className="text-[11px] font-bold text-slate-400 uppercase truncate">{c.company}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(c)}
                      className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-[12px] text-slate-500 font-medium">
                  {c.email && <div className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 shrink-0 text-slate-300" /> {c.email}</div>}
                  {c.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 text-slate-300" /> {c.phone}</div>}
                  {c.terms && <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 shrink-0 text-slate-300" /> {c.terms}</div>}
                  {c.billing_address && <div className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300 mt-0.5" /> <span className="truncate">{c.billing_address}</span></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl bg-white p-0 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-slate-700">
              {editing?.id ? (es ? "Editar Cliente" : "Edit Client") : (es ? "Nuevo Cliente" : "New Client")}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setEditing(null)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {editing && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={es ? "Nombre del Cliente *" : "Client Name *"} icon={Users}>
                <input value={editing.name} onChange={(e) => setField("name", e.target.value)}
                  className={cn(INPUT_CLS, "uppercase")} placeholder={es ? "Nombre" : "Name"} />
              </Field>
              <Field label={es ? "Compañía" : "Company"} icon={Building2}>
                <input value={editing.company} onChange={(e) => setField("company", e.target.value)}
                  className={INPUT_CLS} placeholder={es ? "Marca / compañía emisora" : "Brand / billing company"} />
              </Field>
              <Field label={es ? "Contacto" : "Contact"} icon={Users}>
                <input value={editing.contact} onChange={(e) => setField("contact", e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label="Email" icon={Mail}>
                <input type="email" value={editing.email} onChange={(e) => setField("email", e.target.value)}
                  className={INPUT_CLS} placeholder="cliente@empresa.com" />
              </Field>
              <Field label={es ? "Teléfono" : "Phone"} icon={Phone}>
                <input value={editing.phone} onChange={(e) => setField("phone", e.target.value)} className={INPUT_CLS} />
              </Field>
              <Field label={es ? "Términos de Pago" : "Payment Terms"} icon={FileText}>
                <input value={editing.terms} onChange={(e) => setField("terms", e.target.value)}
                  className={INPUT_CLS} placeholder="Net 30" />
              </Field>
              <Field label={es ? "RFC / Tax ID" : "Tax ID"} icon={FileText}>
                <input value={editing.tax_id} onChange={(e) => setField("tax_id", e.target.value)} className={INPUT_CLS} />
              </Field>
              <div className="sm:col-span-2">
                <Field label={es ? "Dirección de Facturación" : "Billing Address"} icon={MapPin}>
                  <input value={editing.billing_address} onChange={(e) => setField("billing_address", e.target.value)} className={INPUT_CLS} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label={es ? "Dirección de Envío" : "Shipping Address"} icon={MapPin}>
                  <input value={editing.shipping_address} onChange={(e) => setField("shipping_address", e.target.value)} className={INPUT_CLS} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label={es ? "Notas" : "Notes"} icon={FileText}>
                  <textarea value={editing.notes} onChange={(e) => setField("notes", e.target.value)}
                    className={cn(INPUT_CLS, "h-auto min-h-[70px] py-2 resize-y")} />
                </Field>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}
              className="h-10 px-5 text-xs font-black uppercase border-slate-300">
              {es ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={saving}
              className="h-10 px-6 text-xs font-black uppercase bg-[#0F172A] text-white hover:bg-slate-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              {es ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
        <Icon className="h-3 w-3 text-slate-300" /> {label}
      </label>
      {children}
    </div>
  )
}
