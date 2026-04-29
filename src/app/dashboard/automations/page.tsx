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
  Mail,
  Slack,
  LayoutGrid,
  ArrowLeft,
  Bell,
  Workflow
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
            <Workflow className="h-8 w-8 text-[#0EA5E9]" />
            Automatizaciones & Config
          </h1>
          <p className="text-slate-400 font-medium mt-1">Define las reglas lógicas que mueven tu fábrica.</p>
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
          className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-black uppercase tracking-widest text-xs px-6 py-6 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={3} /> Nueva Regla
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0B1120] border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#0EA5E9]/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">Reglas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{automations.filter(a => a.is_active).length}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0B1120] border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">Ejecuciones Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-500">---</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0B1120] border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">Estado Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              <div className="text-xl font-bold text-white uppercase tracking-tight">En Línea</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#0EA5E9] animate-spin" />
          </div>
        ) : automations.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
            <Bell className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No hay reglas configuradas</p>
            <Button variant="link" className="text-[#0EA5E9] mt-2 font-black italic">Comienza creando tu primera automatización</Button>
          </div>
        ) : (
          automations.map((auto) => (
            <Card key={auto.automation_id} className={`bg-[#0B1120] border-slate-800 shadow-2xl transition-all hover:border-[#0EA5E9]/30 relative overflow-hidden group ${!auto.is_active && 'opacity-60 grayscale'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${auto.is_active ? 'bg-[#0EA5E9]/10 text-[#0EA5E9]' : 'bg-slate-800 text-slate-500'}`}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black text-white tracking-tight uppercase italic">{auto.name}</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={auto.is_active} onCheckedChange={() => handleToggle(auto)} />
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-500" onClick={() => handleDelete(auto.automation_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="flex flex-col gap-4">
                  {/* IF */}
                  <div className="flex gap-4">
                    <div className="w-px bg-slate-800 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#0B1120] border border-slate-800 rounded-full flex items-center justify-center text-[8px] font-black text-slate-500">IF</div>
                    </div>
                    <div className="flex-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                      <div className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-widest mb-1">{TRIGGER_LABELS[auto.trigger_type]}</div>
                      <div className="text-sm font-bold text-white">
                        {auto.trigger_conditions?.watch_field ? `Cuando ${auto.trigger_conditions.watch_field} sea "${auto.trigger_conditions.watch_value}"` : 'Ejecutar siempre'}
                      </div>
                    </div>
                  </div>

                  {/* THEN */}
                  <div className="flex gap-4">
                    <div className="w-px bg-slate-800 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#0B1120] border border-slate-800 rounded-full flex items-center justify-center text-[8px] font-black text-slate-500">DO</div>
                    </div>
                    <div className="flex-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{ACTION_LABELS[auto.action_type]}</div>
                      <div className="text-sm font-medium text-slate-300">
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
        <DialogContent className="max-w-2xl bg-[#0B1120] border-slate-800 text-white p-0 overflow-hidden">
          <DialogHeader className="p-8 border-b border-slate-800 bg-slate-900/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0EA5E9]/10 rounded-2xl flex items-center justify-center border border-[#0EA5E9]/30">
                <Workflow className="h-6 w-6 text-[#0EA5E9]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Configurar Regla</DialogTitle>
                <p className="text-slate-400 text-sm font-medium">Asistente de configuración paso a paso</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-8">
            {/* Steps Progress */}
            <div className="flex items-center justify-between relative px-10">
              <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-slate-800 -z-10" />
              {[1, 2, 3].map(step => (
                <div key={step} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black transition-all ${wizardStep >= step ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'bg-[#0B1120] border-slate-800 text-slate-600'}`}>
                  {wizardStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
              ))}
            </div>

            {/* Step 1: Trigger */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#0EA5E9]">1. ¿Qué evento dispara esta regla?</label>
                  <select 
                    value={currentAuto.trigger_type}
                    onChange={(e) => setCurrentAuto({...currentAuto, trigger_type: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold"
                  >
                    {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional Fields (Optional for now) */}
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Condiciones Opcionales (SI)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Campo</label>
                      <Input 
                        placeholder="Ej. status" 
                        value={currentAuto.trigger_conditions.watch_field}
                        onChange={(e) => setCurrentAuto({...currentAuto, trigger_conditions: {...currentAuto.trigger_conditions, watch_field: e.target.value}})}
                        className="bg-slate-950 border-slate-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Valor esperado</label>
                      <Input 
                        placeholder="Ej. paid"
                        value={currentAuto.trigger_conditions.watch_value}
                        onChange={(e) => setCurrentAuto({...currentAuto, trigger_conditions: {...currentAuto.trigger_conditions, watch_value: e.target.value}})}
                        className="bg-slate-950 border-slate-800"
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
                  <label className="text-xs font-black uppercase tracking-widest text-emerald-500">2. ¿Qué acción debe realizarse?</label>
                  <select 
                    value={currentAuto.action_type}
                    onChange={(e) => setCurrentAuto({...currentAuto, action_type: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold"
                  >
                    {Object.entries(ACTION_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Action Params */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-4">
                   {currentAuto.action_type === 'send_email' && (
                     <div className="space-y-4">
                        <Input 
                          placeholder="Email destino" 
                          value={currentAuto.action_params.to_email || ''} 
                          onChange={(e) => setCurrentAuto({...currentAuto, action_params: {...currentAuto.action_params, to_email: e.target.value}})}
                          className="bg-slate-950 border-slate-800"
                        />
                        <Input 
                          placeholder="Asunto" 
                          value={currentAuto.action_params.subject || ''} 
                          onChange={(e) => setCurrentAuto({...currentAuto, action_params: {...currentAuto.action_params, subject: e.target.value}})}
                          className="bg-slate-950 border-slate-800"
                        />
                     </div>
                   )}
                   {currentAuto.action_type === 'create_work_order' && (
                     <p className="text-sm text-slate-400 italic">Esta acción generará automáticamente una orden de trabajo lista para producción.</p>
                   )}
                   {/* Add more as needed */}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-white">3. Finalizar Regla</label>
                  <Input 
                    placeholder="Nombre descriptivo de la regla (ej. Auto-Producción)" 
                    value={currentAuto.name}
                    onChange={(e) => setCurrentAuto({...currentAuto, name: e.target.value})}
                    className="bg-slate-900 border-slate-800 h-14 text-lg font-black uppercase italic"
                  />
                </div>

                <Card className="bg-slate-950 border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0EA5E9]/10 rounded-lg text-[#0EA5E9]">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Si ocurre:</span> <span className="font-bold">{TRIGGER_LABELS[currentAuto.trigger_type]}</span>
                      </div>
                    </div>
                    <div className="h-6 border-l-2 border-dashed border-slate-800 ml-4 my-1" />
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <Settings className="h-4 w-4" />
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Entonces:</span> <span className="font-bold">{ACTION_LABELS[auto.action_type]}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setWizardStep(prev => prev - 1)}
                disabled={wizardStep === 1}
                className="text-slate-400 hover:text-white"
              >
                Anterior
              </Button>
              {wizardStep < 3 ? (
                <Button 
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-black uppercase tracking-widest px-8"
                >
                  Siguiente
                </Button>
              ) : (
                <Button 
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
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
