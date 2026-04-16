"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { useI18n } from "@/lib/i18n"
import { AlertCircle, AlertTriangle, ChevronRight, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function ExecutiveAlerts() {
  const { t } = useI18n()
  const { notifications } = useNotifications()
  
  const alerts = notifications.slice(0, 3) // Show only top 3 on home

  return (
    <Card className="rounded-[24px] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          {t("alerts")}
        </CardTitle>
        <Link 
          href="#" 
          className="text-xs text-slate-500 hover:text-primary transition-colors font-medium flex items-center"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400 font-medium italic">No critical alerts detected</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={cn(
                "p-3 rounded-2xl flex gap-3 transition-colors",
                alert.type === 'critical' ? "bg-rose-500/5" : "bg-amber-500/5"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                alert.type === 'critical' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
              )}>
                {alert.type === 'critical' ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate leading-none mb-1">{alert.title}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
