"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Cpu } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface MachineLoadProps {
  data: { id: string; name: string; capacity: number; remainingPieces: number }[]
  title?: string
  description?: string
}

export function MachineLoadBars({ data, title, description }: MachineLoadProps) {
  const { t } = useI18n()
  
  const displayTitle = title || t("machineLoadTitle")
  const displayDesc = description || t("plantResourceView")

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">{displayTitle}</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {displayDesc}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {data.slice(0, 7).map((machine, idx) => (
            <div key={machine.id || idx} className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">{machine.name}</span>
                <span className="text-primary">{machine.remainingPieces?.toLocaleString() || 0} {t("unitsDay").split(" / ")[0]}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(14,165,233,0.4)] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(0, machine.capacity))}%` }}
                />
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest text-center py-4">{t("noTelemetry")}</p>
          ) || null}
        </div>
      </CardContent>
    </Card>
  )
}
