"use client"

import { useState, useEffect } from "react"
import { 
  Zap, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  Check, 
  CheckCircle2, 
  X, 
  Loader2,
  Bell,
  Workflow,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  fetchAutomations, 
  createAutomation, 
  updateAutomation, 
  deleteAutomation 
} from "@/lib/api"
import { toast } from "sonner"

const TRIGGER_LABELS: Record<string, string> = {
  create: 'Nueva Orden (Printavo)',
  update: 'Actualización de Orden',
  status_change: 'Cambio de Estado',
  invoice_create: 'Nueva Factura / Orden Maestra',
  invoice_approve: 'Aprobación de Documento'
}

const ACTION_LABELS: Record<string, string> = {
  move_board: 'Mover Tablero',
  send_email: 'Enviar Email',
  assign_field: 'Asignar Campo',
  notify_slack: 'Notificar Slack',
  create_work_order: 'Generar Orden de Trabajo'
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [currentAuto, setCurrentAuto] = useState<any>({
    name: '',
    trigger_type: 'invoice_approve',
    trigger_conditions: { watch_field: '', watch_value: '' },
    action_type: 'create_work_order',
    action_params: {},
    is_active: true,
    boards: []
  })

  useEffect(() => {
    loadAutomations()
  }, [])

  async function loadAutomations() {
    try {
      setLoading(true)
      const data = await fetchAutomations()
      setAutomations(data)
    } catch (err) {
      toast.error("Error al cargar automatizaciones")
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (auto: any) => {
    try {
      await updateAutomation(auto.automation_id, { ...auto, is_active: !auto.is_active })
      toast.success(`Automatización ${auto.is_active ? 'desactivada' : 'activada'}`)
      loadAutomations()
    } catch (err) {
      toast.error("Error al actualizar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta regla?")) return
    try {
      await deleteAutomation(id)
      toast.success("Regla eliminada")
      loadAutomations()
    } catch (err) {
      toast.error("Error al eliminar")
    }
  }

  const handleSave = async () => {
    if (!currentAuto.name) {
      toast.error("El nombre es requerido")
      return
    }
    try {
      if (currentAuto.automation_id) {
        await updateAutomation(currentAuto.automation_id, currentAuto)
        toast.success("Regla actualizada")
      } else {
        await createAutomation(currentAuto)
        toast.success("Regla creada exitosamente")
      }
      setIsWizardOpen(false)
      loadAutomations()
    } catch (err) {
      toast.error("Error al guardar")
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-12 bg-[#0091D5] rounded-full shadow-[0_0_20px_rgba(0,145,213,0.4)]" />
             <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase italic leading-none flex items-center gap-3">
                <Workflow className="h-10 w-10 text-[#0091D5]" />
                Automations
             </h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-6 opacity-70">
            Prosper Manufacturing &bull; Logic & Routing
          </p>
        </div>
        <Button 
          onClick={() => {
            setCurrentAuto({
              name: '',
              trigger_type: 'invoice_approve',
              trigger_conditions: { watch_field: '', watch_value: '' },
              action_type: 'create_work_order',
              action_params: {},
              is_active: true,
              boards: []
            })
            setWizardStep(1)
            setIsWizardOpen(true)
          }}
          className="bg-[#0091D5] hover:bg-[#0081C0] text-white font-black uppercase tracking-widest text-xs px-8 h-14 rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="mr-3 h-5 w-5" strokeWidth={3} /> Nueva Regla
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
               <div className="flex items-center">
                  <div className="w-2 h-24 bg-[#0091D5] shadow-[0_0_20px_rgba(0,145,213,0.2)]" />
                  <div className="p-8 flex items-center gap-6 w-full">
                     <div className="w-14 h-14 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-[#0091D5] group-hover:scale-110 transition-transform shadow-inner">
                        <Zap className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reglas Activas</p>
                        <p className="text-3xl font-black text-[#0F172A] tracking-tighter">{automations.filter(a => a.is_active).length}</p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
               <div className="flex items-center">
                  <div className="w-2 h-24 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
                  <div className="p-8 flex items-center gap-6 w-full">
                     <div className="w-14 h-14 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-inner">
                        <Workflow className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ejecuciones Hoy</p>
                        <p className="text-3xl font-black text-[#0F172A] tracking-tighter">---</p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-white border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
               <div className="flex items-center">
                  <div className="w-2 h-24 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" />
                  <div className="p-8 flex items-center gap-6 w-full">
                     <div className="w-14 h-14 bg-amber-50 rounded-[1.25rem] flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-inner">
                        <Activity className="h-7 w-7" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado Sistema</p>
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                           <p className="text-xl font-black text-[#0F172A] tracking-tighter uppercase">En Línea</p>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#0091D5] animate-spin" />
          </div>
        ) : automations.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem]">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No hay reglas configuradas</p>
            <Button variant="link" className="text-[#0091D5] mt-2 font-black italic">Comienza creando tu primera automatización</Button>
          </div>
        ) : (
          automations.map((auto) => (
            <Card key={auto.automation_id} className={`bg-white border-slate-200 shadow-xl shadow-slate-200/50 transition-all hover:border-[#0091D5]/30 rounded-[2rem] overflow-hidden group ${!auto.is_active && 'opacity-60 grayscale'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-4 bg-slate-50/50 border-b border-slate-100 p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${auto.is_active ? 'bg-blue-50 text-[#0091D5]' : 'bg-slate-100 text-slate-400'}`}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-black text-[#0F172A] tracking-tight uppercase italic">{auto.name}</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={auto.is_active} onCheckedChange={() => handleToggle(auto)} />
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 h-10 w-10 rounded-full" onClick={() => handleDelete(auto.automation_id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6 bg-white">
                <div className="flex flex-col gap-4">
                  {/* IF */}
                  <div className="flex gap-4">
                    <div className="w-px bg-slate-200 relative ml-4">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[8px] font-black text-slate-400">IF</div>
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-black text-[#0091D5] uppercase tracking-widest mb-1">{TRIGGER_LABELS[auto.trigger_type]}</div>
                      <div className="text-xs font-black text-[#0F172A] uppercase">
                        {auto.trigger_conditions?.watch_field ? `Cuando ${auto.trigger_conditions.watch_field} sea "${auto.trigger_conditions.watch_value}"` : 'Ejecutar siempre'}
                      </div>
                    </div>
                  </div>

                  {/* THEN */}
                  <div className="flex gap-4">
                    <div className="w-px bg-slate-200 relative ml-4">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[8px] font-black text-slate-400">DO</div>
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{ACTION_LABELS[auto.action_type]}</div>
                      <div className="text-xs font-bold text-slate-600 uppercase">
                        {auto.action_type === 'send_email' ? `Enviar email a ${auto.action_params?.to_email}` : 
                         auto.action_type === 'move_board' ? `Mover a ${auto.action_params?.target_board}` :
                         auto.action_type === 'create_work_order' ? 'Crear orden de trabajo automáticamente' :
                         'Acción configurada'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-3xl bg-white border-slate-200 text-slate-900 p-0 overflow-hidden rounded-[2rem] shadow-2xl">
          <DialogHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
                <Workflow className="h-7 w-7 text-[#0091D5]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tight text-[#0F172A]">Configurar Regla</DialogTitle>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Asistente de configuración paso a paso</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-10 space-y-10">
            {/* Steps Progress */}
            <div className="flex items-center justify-between relative px-10">
              <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-slate-100 -z-10" />
              {[1, 2, 3].map(step => (
                <div key={step} className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black transition-all bg-white ${wizardStep >= step ? 'border-[#0091D5] text-[#0091D5] shadow-[0_0_20px_rgba(0,145,213,0.3)]' : 'border-slate-200 text-slate-300'}`}>
                  {wizardStep > step ? <Check className="h-6 w-6" /> : step}
                </div>
              ))}
            </div>

            {/* Step 1: Trigger */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0091D5]">1. ¿Qué evento dispara esta regla?</label>
                  <select 
                    value={currentAuto.trigger_type}
                    onChange={(e) => setCurrentAuto({...currentAuto, trigger_type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-[#0091D5]/20"
                  >
                    {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condiciones Opcionales (SI)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campo</label>
                      <Input 
                        placeholder="Ej. status" 
                        value={currentAuto.trigger_conditions.watch_field}
                        onChange={(e) => setCurrentAuto({...currentAuto, trigger_conditions: {...currentAuto.trigger_conditions, watch_field: e.target.value}})}
                        className="bg-white border-slate-200 h-12 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor esperado</label>
                      <Input 
                        placeholder="Ej. paid"
                        value={currentAuto.trigger_conditions.watch_value}
                        onChange={(e) => setCurrentAuto({...currentAuto, trigger_conditions: {...currentAuto.trigger_conditions, watch_value: e.target.value}})}
                        className="bg-white border-slate-200 h-12 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Action */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">2. ¿Qué acción debe realizarse?</label>
                  <select 
                    value={currentAuto.action_type}
                    onChange={(e) => setCurrentAuto({...currentAuto, action_type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {Object.entries(ACTION_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4">
                   {currentAuto.action_type === 'send_email' && (
                     <div className="space-y-4">
                        <Input 
                          placeholder="Email destino" 
                          value={currentAuto.action_params.to_email || ''} 
                          onChange={(e) => setCurrentAuto({...currentAuto, action_params: {...currentAuto.action_params, to_email: e.target.value}})}
                          className="bg-white border-emerald-200 h-12 rounded-xl"
                        />
                        <Input 
                          placeholder="Asunto" 
                          value={currentAuto.action_params.subject || ''} 
                          onChange={(e) => setCurrentAuto({...currentAuto, action_params: {...currentAuto.action_params, subject: e.target.value}})}
                          className="bg-white border-emerald-200 h-12 rounded-xl"
                        />
                     </div>
                   )}
                   {currentAuto.action_type === 'create_work_order' && (
                     <p className="text-xs font-bold text-emerald-700 uppercase">Esta acción generará automáticamente una orden de trabajo lista para producción.</p>
                   )}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">3. Finalizar Regla</label>
                  <Input 
                    placeholder="Nombre descriptivo de la regla (ej. Auto-Producción)" 
                    value={currentAuto.name}
                    onChange={(e) => setCurrentAuto({...currentAuto, name: e.target.value})}
                    className="bg-slate-50 border-slate-200 h-16 text-lg font-black uppercase italic rounded-2xl px-6 focus:ring-2 focus:ring-[#0091D5]/20"
                  />
                </div>

                <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl text-[#0091D5]">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div className="text-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Si ocurre:</span> 
                        <span className="font-black text-[#0F172A] uppercase">{TRIGGER_LABELS[currentAuto.trigger_type]}</span>
                      </div>
                    </div>
                    <div className="h-8 border-l-2 border-dashed border-slate-200 ml-6 my-2" />
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div className="text-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Entonces:</span> 
                        <span className="font-black text-[#0F172A] uppercase">{ACTION_LABELS[currentAuto.action_type]}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={() => setWizardStep(prev => prev - 1)}
                disabled={wizardStep === 1}
                className="text-slate-400 hover:text-slate-600 font-black uppercase text-[10px] tracking-widest h-12 px-6"
              >
                Anterior
              </Button>
              {wizardStep < 3 ? (
                <Button 
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="bg-[#0091D5] hover:bg-[#0081C0] text-white font-black uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-blue-500/20"
                >
                  Siguiente
                </Button>
              ) : (
                <Button 
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Guardar Regla
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
