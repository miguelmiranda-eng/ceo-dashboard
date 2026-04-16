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
    <Card className="rounded-[24px] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden col-span-full xl:col-span-1">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">{t("machines")}</CardTitle>
        <CardDescription>{t("status")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">{t("activeMachines")}</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{active}</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">{t("inactiveMachines")}</span>
            </div>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{inactive}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t("details")}</h4>
          <div className="space-y-4">
            {machines.map((machine) => (
              <div key={machine.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={machine.status === "active" ? "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" : "w-2 h-2 rounded-full bg-rose-500"} />
                    <span className="text-sm font-medium">{machine.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{machine.capacity}%</span>
                </div>
                <Progress value={machine.capacity} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
