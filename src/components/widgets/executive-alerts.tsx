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
    <Card className="rounded-none border border-border shadow-sm bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-extrabold uppercase tracking-[0.1em] flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          {t("alerts")}
        </CardTitle>
        <Link 
          href="#" 
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-extrabold uppercase tracking-wide flex items-center gap-1"
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
                "p-3 rounded-none flex gap-3 transition-colors border-l-4",
                alert.type === 'critical' ? "bg-primary text-white border-white" : "bg-muted border-primary"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-none flex items-center justify-center shrink-0",
                alert.type === 'critical' ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
              )}>
                {alert.type === 'critical' ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-tight truncate leading-none mb-1.5">{alert.title}</p>
                <p className={cn(
                  "text-[11px] font-bold leading-tight line-clamp-2",
                  alert.type === 'critical' ? "text-white/80" : "text-muted-foreground"
                )}>{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
