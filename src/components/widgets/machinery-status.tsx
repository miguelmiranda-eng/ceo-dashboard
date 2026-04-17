"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import { Machine } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Cpu, Activity, AlertCircle } from "lucide-react"

interface MachineryStatusProps {
  active: number
  inactive: number
  machines: Machine[]
}

export function MachineryStatus({ active, inactive, machines }: MachineryStatusProps) {
  const { t } = useI18n()

  return (
    <Card className="rounded-none border border-border shadow-sm bg-card overflow-hidden col-span-full xl:col-span-1">
      <CardHeader className="px-6 mt-2">
        <CardTitle className="text-xs font-extrabold uppercase tracking-[0.1em] text-foreground">{t("machines")}</CardTitle>
        <CardDescription className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-1">{t("status")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-none bg-primary text-white border border-primary shadow-[0_4px_10px_rgba(30,91,255,0.3)]">
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="h-4 w-4" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide">{t("activeMachines")}</span>
            </div>
            <p className="text-3xl font-extrabold">{active}</p>
          </div>
          <div className="p-4 rounded-none bg-muted border border-border text-foreground">
            <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
              <AlertCircle className="h-4 w-4" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide">{t("inactiveMachines")}</span>
            </div>
            <p className="text-3xl font-extrabold">{inactive}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-[0.1em]">{t("details")}</h4>
          <div className="space-y-4">
            {machines.map((machine) => (
              <div key={machine.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={machine.status === "active" ? "w-2.5 h-2.5 rounded-none bg-primary animate-pulse" : "w-2.5 h-2.5 rounded-none bg-muted-foreground"} />
                    <span className="text-xs font-extrabold uppercase tracking-tight">{machine.name}</span>
                  </div>
                  <span className="text-[11px] font-extrabold tabular-nums text-muted-foreground">{machine.capacity}%</span>
                </div>
                <Progress value={machine.capacity} className="h-1 rounded-none bg-muted overflow-hidden" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
